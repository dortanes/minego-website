"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Payment_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Payment"));
const PackGiverController_1 = __importDefault(require("./PackGiverController"));
class YooMoneyPayController {
    async hook({ request, response }) {
        const data = request.body();
        console.trace(data);
        try {
            if (data.test_notification !== false)
                throw 'IS_TEST';
            if (data.codepro === true)
                throw 'IS_CODEPRO';
            if (!data.amount ||
                !data.operation_id ||
                !data.notification_type ||
                !data.sha1_hash ||
                !data.label)
                throw 'INCORRECT_BODY';
            const payload = {
                notification_type: data.notification_type,
                operation_id: data.operation_id,
                amount: data.amount,
                currency: data.currency,
                datetime: data.datetime,
                sender: data.sender,
                codepro: data.codepro,
                notification_secret: process.env.YOOMONEY_SECRET,
                label: data.label,
            };
            console.log('payload =', payload);
            const signature = require('crypto')
                .createHash('sha1')
                .update(Object.values(payload).join('&'))
                .digest('hex');
            if (data.sha1_hash !== signature)
                throw 'SIGNATURE_INCORRECT';
            const payment = await Payment_1.default.find(Number(data.label));
            if (!payment || payment.status !== 'created')
                throw 'PAYMENT_NOT_EXIST';
            if (payment.amount !== Number(data.amount))
                throw 'INCORRECT_AMOUNT';
            await new PackGiverController_1.default().execute(payment);
            payment.kassaPaymentId = data.operation_id;
            payment.email = data.email;
            payment.phone = data.phone;
            payment.currencyId = data.currency;
            payment.wallet = data.sender;
            payment.status = 'finished';
            await payment.save();
            return 'OK';
        }
        catch (err) {
            console.error(err, data);
            return response.status(500).send(err?.message ?? err);
        }
    }
}
exports.default = YooMoneyPayController;
//# sourceMappingURL=YooMoneyPayController.js.map