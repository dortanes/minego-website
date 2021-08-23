"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MakePaymentUrl_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Helpers/MakePaymentUrl"));
const Payment_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Payment"));
const PackGiverController_1 = __importDefault(require("./PackGiverController"));
class FKPayController {
    async hook({ request, response }) {
        const data = request.body();
        console.trace(data);
        try {
            if (data.MERCHANT_ID !== process.env.FREEKASSA_ID)
                throw 'INCORRECT_MERCHANT_ID';
            if (!data.MERCHANT_ID ||
                !data.AMOUNT ||
                !data.MERCHANT_ORDER_ID ||
                !data.intid ||
                !data.CUR_ID ||
                !data.SIGN)
                throw 'INCORRECT_BODY';
            const { signature } = MakePaymentUrl_1.default({
                AMOUNT: data.AMOUNT,
                MERCHANT_ORDER_ID: data.MERCHANT_ORDER_ID,
                MERCHANT_ID: data.MERCHANT_ID,
            }, process.env.FREEKASSA_WORD2);
            if (data.SIGN !== signature)
                throw 'SIGNATURE_INCORRECT';
            const payment = await Payment_1.default.find(data.MERCHANT_ORDER_ID);
            if (!payment || payment.status !== 'created')
                throw 'PAYMENT_NOT_EXIST';
            if (payment.amount !== parseInt(data.AMOUNT))
                throw 'INCORRECT_AMOUNT';
            await new PackGiverController_1.default().execute(payment);
            payment.kassaPaymentId = data.intid;
            payment.email = data.P_EMAIL;
            payment.phone = data.P_PHONE;
            payment.currencyId = data.CUR_ID;
            payment.wallet = data.payer_account;
            payment.status = 'finished';
            await payment.save();
            return 'YES';
        }
        catch (err) {
            console.error(err);
            return response.status(500).send(err?.message ?? err);
        }
    }
}
exports.default = FKPayController;
//# sourceMappingURL=FKPayController.js.map