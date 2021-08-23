"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Payment_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Payment"));
class EnotPayController {
    async hook() {
        return await Payment_1.default.findMany([]);
    }
}
exports.default = EnotPayController;
//# sourceMappingURL=EnotPayController.js.map