/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import YooMoneyPayController from 'App/Controllers/Http/YooMoneyPayController'
import Pack from 'App/Models/Pack'
import API from 'node-mc-api'

// Чекаем платежи с разным интервалом
function a() {
  setTimeout(async () => {
    await new YooMoneyPayController().checkPayments()
    a()
  }, 20 * 1000 + Math.floor(Math.random() * 10000))
}
a()

Route.group(() => {
  Route.group(() => {
    Route.post('pm.hook.ap', 'AnyPayController.hook')
    Route.post('pm.hook.fk', 'FKPayController.hook')
  })
  Route.get('ping', async () => (await API.pingServer('172.18.0.1'))?.players)
}).prefix('api')

Route.get('/', async ({ view }) =>
  view.render('home', {
    packs: await Pack.query().where('active', '=', true),
  })
)
Route.get('/privacy-policy', async ({ view }) => view.render('privacy-policy'))
Route.get('/user-agreement', async ({ view }) => view.render('user-agreement'))
Route.get('/help', async ({ view }) => view.render('help'))
Route.get('/rules', async ({ view }) => view.render('rules'))

Route.any('/buy', 'BuyController.buy')
Route.get('/buy/:nickname/:id/:promocode?', 'BuyController.buy')
Route.get('/pay/:operator/:nickname/:id/:promocode?', 'BuyController.pay')
