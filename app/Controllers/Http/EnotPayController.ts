// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Payment from 'App/Models/Payment'

export default class EnotPayController {
  /**
   * Хук (оповещение об оплате)
   * @param ctx
   */
  public async hook() {
    return await Payment.findMany([])
  } // ctx: HttpContextContract
}
