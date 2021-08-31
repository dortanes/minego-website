"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yoomoney_sdk_1 = require("yoomoney-sdk");
const moment_1 = __importDefault(require("moment"));
const Payment_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Payment"));
const PackGiverController_1 = __importDefault(require("./PackGiverController"));
const ymClient = new yoomoney_sdk_1.YMApi(String(process.env.YOOMONEY_TOKEN));
class YooMoneyPayController {
    async checkPayments() {
        const whereTime = moment_1.default().subtract(4, 'hours').toISOString();
        const createdPayments = await Payment_1.default.query()
            .where('operator', '=', 'mts')
            .andWhere('status', '=', 'created')
            .andWhere('created_at', '>', whereTime)
            .limit(3);
        const operations = await ymClient.operationHistory({
            records: 3,
            type: 'deposition',
            from: whereTime,
            details: true,
        });
        createdPayments.forEach(async (payment) => {
            try {
                const operation = operations.operations.find((operation) => operation.amount === payment.amount && operation.title.indexOf('МТС') !== -1);
                if (!operation)
                    throw 'OPERATION_NOT_FOUND';
                const paymentDate = moment_1.default(payment.createdAt.toUTC().toISO());
                const operationDate = moment_1.default(operation.datetime);
                const dateDiff = operationDate.diff(paymentDate, 'hours');
                console.log('[CHECK LOG] timeDiff =', dateDiff, paymentDate.toISOString(), operationDate.toISOString());
                if (dateDiff > 1)
                    throw 'OLD_RECORD [' + dateDiff + ']';
                const phone = Number(operation.details?.split('телефона ')[1].split(',')[0]);
                await new PackGiverController_1.default().execute(payment);
                payment.kassaPaymentId = Number(operation.operation_id);
                payment.phone = phone;
                payment.wallet = String(operation.sender ?? phone);
                payment.status = 'finished';
                await payment.save();
            }
            catch (err) {
                console.error('[ERROR] PaymentID: ' + payment.id + ':', err);
            }
        });
    }
}
exports.default = YooMoneyPayController;
//# sourceMappingURL=YooMoneyPayController.js.map