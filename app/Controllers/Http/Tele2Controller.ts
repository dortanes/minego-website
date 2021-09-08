// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { URLSearchParams } from 'url'
import Pack from 'App/Models/Pack'
import Payment from 'App/Models/Payment'
import Promocode from 'App/Models/Promocode'
import axios from 'axios'
import PackGiverController from './PackGiverController'

export default class Tele2Controller {
  public async createPayment({ request, response, view }) {
    const params = request.params()
    const { act: qAct, phone: qPhone, paymentId: qPaymentId, code: qCode } = request.qs()

    let promo: Promocode | null = null

    try {
      if (!params.nickname || !params.id) throw new Error('invalid_params')
      // Если валидация - отправляем в другой метод
      if (qAct === 'validate' && qPaymentId && qCode)
        return await this.validateCode(qPaymentId, qCode).then((payId) =>
          response.redirect('/?pay_id=' + payId)
        )

      const nickname = params.nickname
      const phone = Number(qPhone.replace('+8', '7').replace('+', ''))
      const packId = Number(params.id)
      const promoId = params.promocode
      console.log(nickname, packId, promoId)

      if (!nickname) throw 'Введи ник'
      if (!packId) throw 'Выбери привилегию'
      if (!new RegExp('^\\w{3,20}$').test(nickname)) throw 'Неверный ник'

      const pack = await Pack.find(packId)
      if (!pack) throw 'Привилегия не найдена'
      if (!pack.active) throw 'Привилегия недоступна'

      if (promoId) {
        promo = await Promocode.findBy('code', promoId)
        if (!promo) throw 'Промокод не найден'
        if (!promo.active || promo.used === promo.limit) throw 'Промокод недоступен'
      }

      const price = promo ? pack.amount * (1 - promo.percent / 100) : pack.amount
      console.log(price)

      // --- Отправка запроса в Tele2 ---
      const createParams = new URLSearchParams()
      createParams.append('subscriber', String(phone))
      createParams.append('amount', String(price))
      createParams.append('card', String(process.env.CARD_NUMBER))
      createParams.append('type', 'card')
      let createReq: any = await axios
        .post('https://api.sibinco.ru/tele2/web/payment', createParams, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
            'Referer': 'https://f.tele2.ru/',
          },
        })
        .catch((e) => {
          console.error(e)
          throw 'Ошибка связи с Tele2. Повторите попытку позже.'
        })
      console.log('createReq =', createReq, Boolean(createReq?.data?.success))
      createReq = createReq?.data
      if (createReq?.success !== 'true') {
        throw new Error('Ты неверно ввёл номер, либо ошибка на стороне Tele2.')
      }
      // --- Отправка запроса в Tele2 ---
      const { paymentId, fee, amount_total: amountTotal } = createReq

      const payment = await Payment.create({
        packId: packId,
        promocode: promoId,
        phone,
        kassaPaymentId: paymentId,
        amount: price,
        operator: 'tele2',
        nickname,
      })

      // Увеличиваем кол-во использований
      if (promo) {
        promo.used = promo.used + 1
        await promo.save()
      }

      return view.render('payTele2Code', {
        nickname,
        packId,
        promoId,
        fee,
        amountTotal,
        paymentId: payment.id,
      })
    } catch (err) {
      console.error(err)
      return response.redirect('/?error=' + err?.message ?? err)
    }
  }

  public async validateCode(paymentId: number, code: number) {
    const payment = await Payment.find(paymentId)
    if (!payment) throw 'Счёт не найден'

    if (payment.status !== 'created') return

    // --- Отправка запроса в Tele2 ---
    const createParams = new URLSearchParams()
    createParams.append('code', String(code))
    createParams.append('paymentId', String(payment.kassaPaymentId))
    let createReq: any = await axios
      .post('https://api.sibinco.ru/tele2/web/validate', createParams, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 6.0; ru-RU; rv:1.9.0.20) Gecko/20131127 Firefox/37.0',
          'Referer': 'https://f.tele2.ru/',
        },
      })
      .catch((e) => {
        console.error(e)
        throw 'Ошибка связи с Tele2. Повторите попытку позже.'
      })
    console.log('createReq =', createReq, Boolean(createReq?.data?.success))
    createReq = createReq?.data
    if (createReq?.success !== 'true') {
      throw new Error('Ты неверно ввёл код или что-то пошло не так. Попробуй ещё раз')
    }
    // --- Отправка запроса в Tele2 ---

    await new PackGiverController().execute(payment)

    // Финишируем платёж
    payment.status = 'finished'
    await payment.save()

    return payment.kassaPaymentId
  }
}
