"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Encryption_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Encryption"));
const yoomoney_sdk_1 = require("yoomoney-sdk");
const moment_1 = __importDefault(require("moment"));
const Payment_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Payment"));
const PackGiverController_1 = __importDefault(require("./PackGiverController"));
class YooMoneyPayController {
    async hook({ request, response }) {
        const { epvdk } = request.params();
        const { id: payId, price, pack } = Encryption_1.default.decrypt(epvdk);
        try {
            if (!payId || !price || !pack)
                throw 'Неверное тело.';
            const payment = await Payment_1.default.find(payId);
            if (!payment || payment.status !== 'created')
                throw 'Платёж не существует.';
            if (payment.amount !== Number(price))
                throw 'Неверная сумма.';
            const ymClient = new yoomoney_sdk_1.YMApi(String(process.env.YOOMONEY_TOKEN));
            const time = moment_1.default().subtract(2, 'minutes').toISOString();
            let ymPayment;
            for (let i = 0; i < 2; i++) {
                const operations = await ymClient.operationHistory({
                    records: 3,
                    type: 'deposition',
                    from: time,
                });
                console.log(String(process.env.YOOMONEY_TOKEN), operations);
                operations.operations.forEach((operation) => {
                    if (operation.amount === price)
                        ymPayment = operation;
                });
                if (!ymPayment)
                    await new Promise((resolve) => {
                        setTimeout(() => {
                            resolve();
                        }, 3000);
                    });
                else
                    i = 2;
            }
            if (!ymPayment)
                throw 'Платёж не найден.';
            await await new PackGiverController_1.default().execute(payment);
            payment.kassaPaymentId = Number(ymPayment.operation_id);
            payment.wallet = String(ymPayment.sender);
            payment.status = 'finished';
            await payment.save();
            return 'OK';
        }
        catch (err) {
            console.error(err, { epvdk, payId, price, pack });
            return response
                .status(500)
                .send((err?.message ?? err) + ' Обратись в поддержку: https://vk.com/minegomc');
        }
    }
}
exports.default = YooMoneyPayController;
//# sourceMappingURL=YooMoneyPayController.js.map