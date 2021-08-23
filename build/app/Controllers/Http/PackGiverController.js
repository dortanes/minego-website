"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rcon_client_1 = require("rcon-client");
const Pack_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Pack"));
class PackGiverController {
    async execute({ nickname, packId }) {
        const pack = await Pack_1.default.query().where('id', '=', packId).select('group').first();
        const credentials = process.env.RCON?.split('@');
        const cmd = String(process.env.RCON_CMD)
            .replace('%nick', nickname)
            .replace('%group', String(pack?.group));
        console.trace(credentials, cmd);
        const rcon = await rcon_client_1.RconClient.connect(credentials[1].split(':')[0], Number(credentials[1].split(':')[1]), credentials[0]);
        return await rcon.send(cmd);
    }
}
exports.default = PackGiverController;
//# sourceMappingURL=PackGiverController.js.map