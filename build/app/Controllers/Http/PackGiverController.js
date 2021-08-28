"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Rcon = require('rcon');
const Pack_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Pack"));
const Setting_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Setting"));
class PackGiverController {
    async execute({ nickname, packId }) {
        const pack = await Pack_1.default.query()
            .where('id', '=', packId)
            .select(['group', 'name', 'case'])
            .first();
        const credentials = process.env.RCON?.split('@');
        const settings = (await Setting_1.default.find(1))?.$extras;
        const commandToGive = pack?.case === true ? settings?.caseGiveCmd : settings?.donGiveCmd;
        console.info('commandToGive =', commandToGive, 'pack =', pack?.toJSON(), 'settings =', settings);
        if (!commandToGive)
            throw 'COMMAND_TO_GIVE_ERR';
        const cmd = String(commandToGive)
            .replace('%nick', nickname)
            .replace('%group', String(pack?.group));
        console.trace(credentials, cmd);
        return await new Promise((resolve, reject) => {
            const rcon = new Rcon(credentials[1].split(':')[0], Number(credentials[1].split(':')[1]), credentials[0]);
            rcon
                .on('auth', () => {
                console.log('rcon >> authenticated! sending command', cmd);
                rcon.send(cmd);
                rcon.send('broadcast &e&lСпасибо &a&l&n' +
                    nickname +
                    '&e&l за покупку привилегии &c&l' +
                    pack?.name +
                    '&e&l!');
            })
                .on('response', (str) => {
                console.log('rcon >> response:', str);
                resolve(true);
            })
                .on('error', (err) => {
                console.error(err);
                reject(err);
            })
                .on('end', () => {
                console.log('rcon >> connection closed');
            });
            rcon.connect();
        });
    }
}
exports.default = PackGiverController;
//# sourceMappingURL=PackGiverController.js.map