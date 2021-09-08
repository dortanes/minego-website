"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const Pack_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Pack"));
const Payment_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Payment"));
const Promocode_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Promocode"));
const axios_1 = __importDefault(require("axios"));
const PackGiverController_1 = __importDefault(require("./PackGiverController"));
class Tele2Controller {
    async createPayment({ request, response, view }) {
        const params = request.params();
        const { act: qAct, phone: qPhone, paymentId: qPaymentId, code: qCode } = request.qs();
        let promo = null;
        try {
            if (!params.nickname || !params.id)
                throw new Error('invalid_params');
            if (qAct === 'validate' && qPaymentId && qCode)
                return await this.validateCode(qPaymentId, qCode).then((payId) => response.redirect('/?pay_id=' + payId));
            const nickname = params.nickname;
            const phone = Number(qPhone.replace('+8', '7').replace('+', ''));
            const packId = Number(params.id);
            const promoId = params.promocode;
            console.log(nickname, packId, promoId);
            if (!nickname)
                throw 'Введи ник';
            if (!packId)
                throw 'Выбери привилегию';
            if (!new RegExp('^\\w{3,20}$').test(nickname))
                throw 'Неверный ник';
            const pack = await Pack_1.default.find(packId);
            if (!pack)
                throw 'Привилегия не найдена';
            if (!pack.active)
                throw 'Привилегия недоступна';
            if (promoId) {
                promo = await Promocode_1.default.findBy('code', promoId);
                if (!promo)
                    throw 'Промокод не найден';
                if (!promo.active || promo.used === promo.limit)
                    throw 'Промокод недоступен';
            }
            const price = promo ? pack.amount * (1 - promo.percent / 100) : pack.amount;
            console.log(price);
            const createParams = new url_1.URLSearchParams();
            createParams.append('subscriber', String(phone));
            createParams.append('amount', String(price));
            createParams.append('card', String(process.env.CARD_NUMBER));
            createParams.append('type', 'card');
            let createReq = await axios_1.default
                .post('https://api.sibinco.ru/tele2/web/payment', createParams, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                    'Referer': 'https://f.tele2.ru/',
                },
            })
                .catch((e) => {
                console.error(e);
                throw 'Ошибка связи с Tele2. Повторите попытку позже.';
            });
            console.log('createReq =', createReq?.data);
            createReq = createReq?.data;
            if (createReq?.success !== 'true') {
                throw new Error('Ты неверно ввёл номер, либо ошибка на стороне Tele2.');
            }
            const { paymentId, fee, amount_total: amountTotal } = createReq;
            const payment = await Payment_1.default.create({
                packId: packId,
                promocode: promoId,
                phone,
                kassaPaymentId: paymentId,
                amount: price,
                operator: 'tele2',
                nickname,
            });
            if (promo) {
                promo.used = promo.used + 1;
                await promo.save();
            }
            return view.render('payTele2Code', {
                nickname,
                packId,
                promoId,
                fee,
                amountTotal,
                paymentId: payment.id,
            });
        }
        catch (err) {
            console.error(err);
            return response.redirect('/?error=' + err?.message ?? err);
        }
    }
    async validateCode(paymentId, code) {
        const payment = await Payment_1.default.find(paymentId);
        if (!payment)
            throw 'Счёт не найден';
        if (payment.status !== 'created')
            return;
        const createParams = new url_1.URLSearchParams();
        createParams.append('code', String(code));
        createParams.append('paymentId', String(payment.kassaPaymentId));
        let createReq = await axios_1.default
            .post('https://api.sibinco.ru/tele2/web/validate', createParams, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.0; ru-RU; rv:1.9.0.20) Gecko/20131127 Firefox/37.0',
                'Referer': 'https://f.tele2.ru/',
            },
        })
            .catch((e) => {
            console.error(e);
            throw 'Ошибка связи с Tele2. Повторите попытку позже.';
        });
        console.log('createReq =', createReq?.data);
        createReq = createReq?.data;
        if (createReq?.success !== 'true') {
            throw new Error('Ты неверно ввёл код или что-то пошло не так. Попробуй ещё раз');
        }
        await new PackGiverController_1.default().execute(payment);
        payment.status = 'finished';
        await payment.save();
        return payment.kassaPaymentId;
    }
}
exports.default = Tele2Controller;
//# sourceMappingURL=Tele2Controller.js.map