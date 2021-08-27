// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import * as Rcon from "rcon"

import Pack from 'App/Models/Pack'

export default class PackGiverController {
  public async execute({ nickname, packId }) {
    const pack = await Pack.query().where('id', '=', packId).select('group').first()

    const credentials: any = process.env.RCON?.split('@')
    const cmd = String(process.env.RCON_CMD)
      .replace('%nick', nickname)
      .replace('%group', String(pack?.group))

    console.trace(credentials, cmd)

    return await new Promise((resolve, reject) => {
      const rcon = new Rcon(
        credentials[1].split(':')[0],
        Number(credentials[1].split(':')[1]),
        credentials[0]
      ); 

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
      })

      rcon.connect();
    })
  }
}
