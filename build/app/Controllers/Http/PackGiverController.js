"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Rcon = __importStar(require("rcon"));
const Pack_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Pack"));
class PackGiverController {
    async execute({ nickname, packId }) {
        const pack = await Pack_1.default.query().where('id', '=', packId).select('group').first();
        const credentials = process.env.RCON?.split('@');
        const cmd = String(process.env.RCON_CMD)
            .replace('%nick', nickname)
            .replace('%group', String(pack?.group));
        console.trace(credentials, cmd);
        return await new Promise((resolve, reject) => {
            const rcon = new Rcon(credentials[1].split(':')[0], Number(credentials[1].split(':')[1]), credentials[0]);
            rcon.on('auth', () => {
                console.log("rcon >> authenticated! sending command", cmd);
                rcon.send(cmd);
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