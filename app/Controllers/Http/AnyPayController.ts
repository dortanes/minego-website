// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Payment from 'App/Models/Payment'
import PackGiverController from './PackGiverController'

export default class AnyPayController {
  /**
   * Хук (оповещение об оплате)
   * @param ctx
   */
  public async hook({ request, response }) {
    const data = request.body()
    console.trace(data)

    try {
      if (data.merchant_id !== process.env.ANYPAY_ID) throw 'INCORRECT_MERCHANT_ID'
      if (!data.amount || !data.pay_id || !data.transaction_id || !data.currency || !data.sign)
        throw 'INCORRECT_BODY'
      if (data.status !== 'paid') throw 'INCORRECT_STATUS'

      const payload = {
        merchantId: process.env.ANYPAY_ID,
        amount: data.amount,
        payId: data.pay_id,
        secretKey: process.env.ANYPAY_KEY,
      }
      const signature = require('crypto')
        .createHash('md5')
        .update(Object.values(payload).join(':'))
        .digest('hex')

      if (data.sign !== signature) throw 'SIGNATURE_INCORRECT'

      const payment = await Payment.find(data.pay_id)
      if (!payment || payment.status !== 'created') throw 'PAYMENT_NOT_EXIST'

      if (payment.amount !== Number(data.amount)) throw 'INCORRECT_AMOUNT'

      await new PackGiverController().execute(payment)

      // Финишируем платёж
      payment.kassaPaymentId = data.transaction_id
      payment.email = data.email
      payment.currencyId = data.CUR_ID
      payment.wallet = data.method
      payment.status = 'finished'
      await payment.save()

      return 'OK'
    } catch (err) {
      console.error(err, data)
      return response.status(500).send(err?.message ?? err)
    }
  }
}
