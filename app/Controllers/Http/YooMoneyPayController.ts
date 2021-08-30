// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class YooMoneyPayController {
  public async hook({ request, response }) {
    const data = request.body()
    console.trace(data)
    return 'OK'
  }
}
