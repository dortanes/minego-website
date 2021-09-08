"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Route_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Route"));
const YooMoneyPayController_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Controllers/Http/YooMoneyPayController"));
const Pack_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Pack"));
const Payment_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Payment"));
const moment_1 = __importDefault(require("moment"));
const node_mc_api_1 = __importDefault(require("node-mc-api"));
async function checkPayments() {
    function randomInteger(min, max) {
        let rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
    }
    try {
        await new YooMoneyPayController_1.default().checkPayments();
    }
    catch (err) {
        console.error('Error occured while check YooMoney payments:', err);
    }
    setTimeout(() => checkPayments(), 60 * 1000 + randomInteger(1, 30) * 1000);
}
checkPayments();
async function cleanOldPayments() {
    try {
        await Promise.all((await Payment_1.default.query()
            .where('updated_at', '<', moment_1.default().utc().subtract(6, 'hours').toISOString())
            .andWhere('status', '=', 'created')).map(async (payment) => await payment.delete()));
    }
    catch (err) {
        console.error('Error occured while clean old payments:', err);
    }
    setTimeout(() => cleanOldPayments(), 500 * 1000);
}
cleanOldPayments();
Route_1.default.group(() => {
    Route_1.default.group(() => {
        Route_1.default.post('pm.hook.ap', 'AnyPayController.hook');
        Route_1.default.post('pm.hook.fk', 'FKPayController.hook');
    });
    Route_1.default.get('ping', async () => (await node_mc_api_1.default.pingServer('172.18.0.1'))?.players);
}).prefix('api');
Route_1.default.get('/', async ({ view }) => view.render('home', {
    packs: await Pack_1.default.query().where('active', '=', true),
}));
Route_1.default.get('/privacy-policy', async ({ view }) => view.render('privacy-policy'));
Route_1.default.get('/user-agreement', async ({ view }) => view.render('user-agreement'));
Route_1.default.get('/help', async ({ view }) => view.render('help'));
Route_1.default.get('/rules', async ({ view }) => view.render('rules'));
Route_1.default.any('/buy', 'BuyController.buy');
Route_1.default.get('/buy/:nickname/:id/:promocode?', 'BuyController.buy');
Route_1.default.get('/pay/:operator/:nickname/:id/:promocode?', 'BuyController.pay');
//# sourceMappingURL=routes.js.map