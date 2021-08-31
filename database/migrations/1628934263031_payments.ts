import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Payments extends BaseSchema {
  protected tableName = 'payments'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('packId', 11)
      table.string('status').defaultTo('created')
      table.string('promocode')
      table.decimal('amount', 9, 2)
      table.string('nickname', 20)
      table.string('operator', 7)
      table.bigInteger('kassaPaymentId')
      table.string('email', 30)
      table.bigInteger('phone')
      table.integer('currencyId', 2)
      table.string('wallet')

      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
