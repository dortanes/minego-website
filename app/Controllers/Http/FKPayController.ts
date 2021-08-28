// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import MakePaymentUrl from 'App/Helpers/MakePaymentUrl'
import Payment from 'App/Models/Payment'
import PackGiverController from './PackGiverController'

export default class FKPayController {
  /**
   * Хук (оповещение об оплате)
   * @param ctx
   */
  public async hook({ request, response }) {
    const data = request.body()
    console.trace(data)

    try {
      if (data.MERCHANT_ID !== process.env.FREEKASSA_ID) throw 'INCORRECT_MERCHANT_ID'
      if (
        !data.MERCHANT_ID ||
        !data.AMOUNT ||
        !data.MERCHANT_ORDER_ID ||
        !data.intid ||
        !data.CUR_ID ||
        !data.SIGN
      )
        throw 'INCORRECT_BODY'

      const { signature } = MakePaymentUrl(
        {
          AMOUNT: data.AMOUNT,
          MERCHANT_ORDER_ID: data.MERCHANT_ORDER_ID,
          MERCHANT_ID: data.MERCHANT_ID,
        },
        process.env.FREEKASSA_WORD2
      )

      if (data.SIGN !== signature) throw 'SIGNATURE_INCORRECT'

      const payment = await Payment.find(data.MERCHANT_ORDER_ID)
      if (!payment || payment.status !== 'created') throw 'PAYMENT_NOT_EXIST'

      if (payment.amount !== Number(data.AMOUNT)) throw 'INCORRECT_AMOUNT'

      await new PackGiverController().execute(payment)

      // Финишируем платёж
      payment.kassaPaymentId = data.intid
      payment.email = data.P_EMAIL
      payment.phone = data.P_PHONE
      payment.currencyId = data.CUR_ID
      payment.wallet = data.payer_account
      payment.status = 'finished'
      await payment.save()

      return 'YES'
    } catch (err) {
      console.error(err)
      return response.status(500).send(err?.message ?? err)
    }
  }
}
