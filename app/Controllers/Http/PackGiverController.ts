// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RconClient } from 'rcon-client'

import Pack from 'App/Models/Pack'

export default class PackGiverController {
  public async execute({ nickname, packId }) {
    const pack = await Pack.query().where('id', '=', packId).select('group').first()

    const credentials: any = process.env.RCON?.split('@')
    const cmd = String(process.env.RCON_CMD)
      .replace('%nick', nickname)
      .replace('%group', String(pack?.group))

    console.trace(credentials, cmd)

    const rcon = await RconClient.connect(
      credentials[1].split(':')[0],
      Number(credentials[1].split(':')[1]),
      credentials[0]
    )

    return await rcon.send(cmd)
  }
}
