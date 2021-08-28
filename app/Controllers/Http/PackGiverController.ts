// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
const Rcon = require('rcon')

import Pack from 'App/Models/Pack'
import Setting from 'App/Models/Setting'

export default class PackGiverController {
  public async execute({ nickname, packId }) {
    const pack = await Pack.query()
      .where('id', '=', packId)
      .select(['group', 'name', 'case'])
      .first()

    const credentials: any = process.env.RCON?.split('@')

    const settings = await Setting.find(1)
    const commandToGive = pack?.case === true ? settings?.caseGiveCmd : settings?.donGiveCmd
    console.info('commandToGive =', commandToGive)

    const cmd = String(commandToGive)
      .replace('%nick', nickname)
      .replace('%group', String(pack?.group))

    console.trace(credentials, cmd)

    return await new Promise((resolve, reject) => {
      const rcon = new Rcon(
        credentials[1].split(':')[0],
        Number(credentials[1].split(':')[1]),
        credentials[0]
      )

      rcon
        .on('auth', () => {
          console.log('rcon >> authenticated! sending command', cmd)
          rcon.send(cmd)
          rcon.send(
            'broadcast &e&lСпасибо &a&l&n' +
              nickname +
              '&e&l за покупку привилегии &c&l' +
              pack?.name +
              '&e&l!'
          )
        })
        .on('response', (str) => {
          console.log('rcon >> response:', str)
          resolve(true)
        })
        .on('error', (err) => {
          console.error(err)
          reject(err)
        })
        .on('end', () => {
          console.log('rcon >> connection closed')
        })

      rcon.connect()
    })
  }
}
