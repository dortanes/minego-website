"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Schema"));
class Payments extends Schema_1.default {
    constructor() {
        super(...arguments);
        this.tableName = 'payments';
    }
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.integer('packId', 11);
            table.string('status').defaultTo('created');
            table.string('promocode');
            table.decimal('amount', 9, 2);
            table.string('nickname', 20);
            table.string('operator', 7);
            table.bigInteger('kassaPaymentId');
            table.string('email', 30);
            table.bigInteger('phone');
            table.integer('currencyId', 2);
            table.string('wallet');
            table.timestamps(true, true);
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
exports.default = Payments;
//# sourceMappingURL=1628934263031_payments.js.map