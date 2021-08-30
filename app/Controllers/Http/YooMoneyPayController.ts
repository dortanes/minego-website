// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { Request, Response } from '@adonisjs/core/build/standalone'
import Encryption from '@ioc:Adonis/Core/Encryption'
import { YMApi } from 'yoomoney-sdk'
import moment from 'moment'
import Payment from 'App/Models/Payment'
import PackGiverController from './PackGiverController'
import { Operation } from 'yoomoney-sdk/dist/api.types'

type Nullable<T> = T | undefined | null

export default class YooMoneyPayController {
  public async hook({ request, response }: { request: Request; response: Response }) {
    const { epvdk } = request.params()
    const { id: payId, price, pack }: any = Encryption.decrypt(epvdk)

    try {
      if (!payId || !price || !pack) throw 'Неверное тело.'

      const payment = await Payment.find(payId)
      if (!payment || payment.status !== 'created') throw 'Платёж не существует.'

      if (payment.amount !== Number(price)) throw 'Неверная сумма.'

      // Запрашиваем инфу о платежах из YooMoney
      const ymClient = new YMApi(String(process.env.YOOMONEY_TOKEN))
      const time = moment().subtract(2, 'minutes').toISOString()
      let ymPayment: Nullable<Operation>

      for (let i = 0; i < 2; i++) {
        // Запрашиваем историю операций
        const operations = await ymClient.operationHistory({
          records: 3,
          type: 'deposition',
          from: time,
        })

        operations.operations.forEach((operation) => {
          if (operation.amount === price) ymPayment = operation
        })

        if (!ymPayment)
          await new Promise((resolve: CallableFunction) => {
            setTimeout(() => {
              resolve()
            }, 3000)
          })
        else i = 2
      }

      if (!ymPayment) throw 'Платёж не найден.'

      await await new PackGiverController().execute(payment)

      // Финишируем платёж
      payment.kassaPaymentId = Number(ymPayment.operation_id)
      payment.wallet = String(ymPayment.sender)
      payment.status = 'finished'
      await payment.save()

      return 'OK'
    } catch (err) {
      console.error(err, { epvdk, payId, price, pack })
      return response
        .status(500)
        .send((err?.message ?? err) + ' Обратись в поддержку: https://vk.com/minegomc')
    }
  }
}
