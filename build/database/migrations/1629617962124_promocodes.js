"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Schema"));
class Promocodes extends Schema_1.default {
    constructor() {
        super(...arguments);
        this.tableName = 'promocodes';
    }
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('code').unique();
            table.integer('percent', 3);
            table.integer('inviterId', 11);
            table.boolean('active').defaultTo(true);
            table.integer('used').defaultTo(0);
            table.integer('limit').defaultTo(null);
            table.timestamps(true, true);
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
exports.default = Promocodes;
//# sourceMappingURL=1629617962124_promocodes.js.map