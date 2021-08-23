import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Payments extends BaseSchema {
  protected tableName = 'payments'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('packId', 11)
      table.string('status').defaultTo('created')
      table.string('promocode')
      table.integer('amount', 6)
      table.string('nickname', 12)
      table.integer('kassaPaymentId')
      table.string('email', 30)
      table.integer('phone', 15)
      table.integer('currencyId', 2)
      table.string('wallet')

      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
