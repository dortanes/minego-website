import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'packId' })
  public packId: number

  @column()
  public status: string

  @column()
  public promocode: string

  @column()
  public amount: number

  @column()
  public nickname: string

  @column()
  public operator: string

  @column({ columnName: 'kassaPaymentId' })
  public kassaPaymentId: number

  @column()
  public email: string

  @column()
  public phone: number

  @column({ columnName: 'currencyId' })
  public currencyId: number

  @column()
  public wallet: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
