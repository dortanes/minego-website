"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Rcon = require('rcon');
const Pack_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Pack"));
class PackGiverController {
    async execute({ nickname, packId }) {
        const pack = await Pack_1.default.query().where('id', '=', packId).select('group').first();
        const credentials = process.env.RCON?.split('@');
        const cmd = String(process.env.RCON_CMD)
            .replace('%nick', nickname)
            .replace('%group', String(pack?.group));
        return await new Promise((resolve, reject) => {
            const rcon = new Rcon(credentials[1].split(':')[0], Number(credentials[1].split(':')[1]), credentials[0]);
            rcon.on('auth', () => {
                console.log("rcon >> authenticated! sending command", cmd);
                rcon.send(cmd);
                rcon.send('broadcast &a&lСпасибо &c&l' + nickname + ' &a&lза покупку привилегии &f&l' + String(pack?.name) + '&a&l!');
            }).on('response', (str) => {
                console.log('rcon >> response:', str);
                resolve(true);
            }).on('error', (err) => {
                console.error(err);
                reject(err);
            }).on('end', () => {
                console.log('rcon >> connection closed');
            });
            rcon.connect();
        });
    }
}
exports.default = PackGiverController;
//# sourceMappingURL=PackGiverController.js.map