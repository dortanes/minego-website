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

    const settings = (await Setting.find(1))?.$extras
    console.log(
      'boolean',
      Boolean(pack?.toJSON()?.case),
      'no boolean',
      pack?.toJSON()?.case,
      pack?.toJSON()
    )
    const commandToGive =
      Boolean(pack?.toJSON()?.case) === true ? settings?.caseGiveCmd : settings?.donGiveCmd
    console.info('commandToGive =', commandToGive, 'pack =', pack?.toJSON(), 'settings =', settings)

    if (!commandToGive) throw 'COMMAND_TO_GIVE_ERR'

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
            'bossbar msg:"&eСпасибо &c' +
              nickname +
              '&e за покупку доната &a&l' +
              pack?.name +
              '&e!" time:30 player:@a color:yellow'
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
