"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Encryption_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Encryption"));
const Promocode_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Promocode"));
const Pack_1 = __importDefault(require("../../Models/Pack"));
const Payment_1 = __importDefault(require("../../Models/Payment"));
const MakePaymentUrl_1 = __importDefault(require("../../Helpers/MakePaymentUrl"));
class BuyController {
    async buy({ request, view, response }) {
        const data = request.all();
        const params = request.params();
        let promo;
        try {
            const nickname = data.nickname ?? params.nickname;
            const packId = Number(data.id_pack ?? params.id);
            const promoId = data.promocode ?? params.promocode;
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
            return view.render('pay', {
                nickname,
                packId,
                promoId,
                pack,
                makeAnyPayLink: this.makeAnyPayLink,
            });
        }
        catch (err) {
            console.error(err);
            return response.redirect('/?error=' + err);
        }
    }
    async pay({ request, response }) {
        const data = request.all();
        const params = request.params();
        let promo = null;
        try {
            const nickname = data.nickname ?? params.nickname;
            const packId = Number(data.id_pack ?? params.id);
            const promoId = data.promocode ?? params.promocode;
            const operator = data.operator ?? params.operator;
            console.log(nickname, packId, promoId, operator);
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
            const payment = await Payment_1.default.create({
                packId: packId,
                promocode: promoId,
                amount: price,
                operator,
                nickname,
            });
            let redirectUri;
            let fkRes;
            switch (operator) {
                case 'qiwi':
                    redirectUri = this.makeAnyPayLink(price, payment.id, 'qiwi', pack);
                    break;
                case 'yoom':
                    fkRes = MakePaymentUrl_1.default({
                        oa: price,
                        o: payment.id,
                        m: process.env.FREEKASSA_ID,
                        currency: 'RUB',
                        i: 6,
                    }, process.env.FREEKASSA_WORD1);
                    if (!fkRes?.url)
                        throw 'Неизвестная ошибка';
                    redirectUri = fkRes?.url;
                    break;
                case 'card':
                    redirectUri = this.makeAnyPayLink(price, payment.id, 'card', pack);
                    break;
                case 'appl':
                    redirectUri = this.makeAnyPayLink(price, payment.id, 'applepay', pack);
                    break;
                case 'goog':
                    redirectUri = this.makeAnyPayLink(price, payment.id, 'googlepay', pack);
                    break;
                case 'mega':
                    redirectUri = this.makeAnyPayLink(price, payment.id, 'megafon', pack);
                    break;
                case 'beel':
                    redirectUri = this.makeAnyPayLink(price, payment.id, 'beeline', pack);
                    break;
                case 'mts':
                    redirectUri = this.makeMtsLink(price, payment.id, pack);
                    break;
                case 'term':
                    redirectUri = this.makeAnyPayLink(price, payment.id, 'term', pack);
                    break;
                case 'advc':
                    redirectUri = this.makeAnyPayLink(price, payment.id, 'advcash', pack);
                    break;
                case 'perf':
                    redirectUri = this.makeAnyPayLink(price, payment.id, 'pm', pack);
                    break;
                case 'eth':
                    fkRes = MakePaymentUrl_1.default({
                        oa: price,
                        o: payment.id,
                        m: process.env.FREEKASSA_ID,
                        currency: 'RUB',
                        i: 26,
                    }, process.env.FREEKASSA_WORD1);
                    if (!fkRes?.url)
                        throw 'Неизвестная ошибка';
                    redirectUri = fkRes?.url;
                    break;
                case 'ltc':
                    fkRes = MakePaymentUrl_1.default({
                        oa: price,
                        o: payment.id,
                        m: process.env.FREEKASSA_ID,
                        currency: 'RUB',
                        i: 25,
                    }, process.env.FREEKASSA_WORD1);
                    if (!fkRes?.url)
                        throw 'Неизвестная ошибка';
                    redirectUri = fkRes?.url;
                    break;
                case 'btc':
                    redirectUri = this.makeAnyPayLink(price, payment.id, 'btc', pack);
                    break;
                case 'btcc':
                    redirectUri = this.makeAnyPayLink(price, payment.id, 'bch', pack);
                    break;
                default:
                    throw 'Неизвестный оператор';
            }
            if (promo) {
                promo.used = promo.used + 1;
                await promo.save();
            }
            await response.redirect(redirectUri);
        }
        catch (err) {
            console.error(err);
            return response.redirect('/?error=' + err);
        }
    }
    async buyTele2({ request, response, view }) {
        const data = request.all();
        const params = request.params();
        let promo;
        try {
            const nickname = data.nickname ?? params.nickname;
            const packId = Number(data.id_pack ?? params.id);
            const promoId = data.promocode ?? params.promocode;
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
            return view.render('payTele2', {
                nickname,
                packId,
                promoId,
                pack,
            });
        }
        catch (err) {
            console.error(err);
            return response.redirect('/?error=' + err);
        }
    }
    makeAnyPayLink(price, id, method, pack) {
        const payload = {
            currency: 'RUB',
            amount: price,
            secretKey: process.env.ANYPAY_KEY,
            merchantId: process.env.ANYPAY_ID,
            payId: id,
        };
        const sign = require('crypto')
            .createHash('md5')
            .update(Object.values(payload).join(':'))
            .digest('hex');
        const desc = 'Оплата привилегии "' + pack.name + '" на mineGO';
        return ('https://anypay.io/merchant?merchant_id=' +
            process.env.ANYPAY_ID +
            '&pay_id=' +
            id +
            '&amount=' +
            price +
            '&desc=' +
            desc +
            '&method=' +
            method +
            '&sign=' +
            sign);
    }
    makeMtsLink(price, id, pack) {
        const desc = 'Оплата привилегии "' + pack.name + '" на mineGO [' + id + ']';
        const epvdk = Encryption_1.default.encrypt({ id, price, pack }, '6h');
        return ('https://yoomoney.ru/topup/mobile/phone-details?receiver=' +
            process.env.YOOMONEY_ID +
            '&sum=' +
            price +
            '&successURL=https://minego.me/api/pm.hook.ym/' +
            epvdk +
            '&label=' +
            id +
            '&targets=' +
            desc +
            '&origin=form&selectedPaymentType=MC&destination=' +
            desc +
            '&form-comment=' +
            desc +
            '&quickpay-form=shop');
    }
}
exports.default = BuyController;
//# sourceMappingURL=BuyController.js.map