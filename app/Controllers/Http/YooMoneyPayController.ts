// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { YMApi } from 'yoomoney-sdk'
import moment from 'moment'
import Payment from 'App/Models/Payment'
import PackGiverController from './PackGiverController'

const ymClient = new YMApi(String(process.env.YOOMONEY_TOKEN))

export default class YooMoneyPayController {
  public async checkPayments() {
    const whereTime = moment().subtract(4, 'hours').toISOString()

    const createdPayments = await Payment.query()
      .where('operator', '=', 'mts')
      .andWhere('status', '=', 'created')
      .andWhere('created_at', '>', whereTime)
      .limit(3)

    // Запрашиваем историю операций
    const operations = await ymClient.operationHistory({
      records: 3,
      type: 'deposition',
      from: whereTime,
      details: true,
    })

    console.log('Pending payments: ' + createdPayments.length)
    console.log('Operations: ' + operations.operations.length)

    createdPayments.forEach(async (payment) => {
      try {
        // Ищем похожую операцию
        const operation = operations.operations.find(
          (operation) =>
            operation.amount === payment.amount && operation.title.indexOf('МТС') !== -1
        )
        if (!operation) throw 'OPERATION_NOT_FOUND'

        // Чекаем разницу во времени
        const paymentDate = moment(payment.createdAt.toUTC().toISO())
        const operationDate = moment(operation.datetime)
        const dateDiff = operationDate.diff(paymentDate, 'hours')

        console.log(
          '[CHECK LOG] timeDiff =',
          dateDiff,
          paymentDate.toISOString(),
          operationDate.toISOString()
        )
        if (dateDiff > 1) throw 'OLD_RECORD [' + dateDiff + ']'

        // Вытаскиваем номер телефона
        const phone = Number(operation.details?.split('телефона ')[1].split(',')[0])

        // Выдаём товар
        await new PackGiverController().execute(payment)

        // Финишируем платёж
        payment.kassaPaymentId = Number(operation.operation_id)
        payment.phone = phone
        payment.wallet = String(operation.sender ?? phone)
        payment.status = 'finished'
        await payment.save()
      } catch (err) {
        console.error('[ERROR] PaymentID: ' + payment.id + ':', err)
      }
    })
  }
}
