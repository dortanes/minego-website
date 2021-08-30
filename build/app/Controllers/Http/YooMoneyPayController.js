"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class YooMoneyPayController {
    async hook({ request }) {
        const data = request.body();
        console.trace(data);
        return 'OK';
    }
}
exports.default = YooMoneyPayController;
//# sourceMappingURL=YooMoneyPayController.js.map