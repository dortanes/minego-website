"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Schema"));
class Packs extends Schema_1.default {
    constructor() {
        super(...arguments);
        this.tableName = 'packs';
    }
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('name');
            table.integer('amount');
            table.integer('icon');
            table.string('group');
            table.boolean('case').defaultTo(false);
            table.boolean('active').defaultTo(true);
            table.timestamps(true, true);
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
exports.default = Packs;
//# sourceMappingURL=1629617498625_packs.js.map