import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Promocodes extends BaseSchema {
  protected tableName = 'promocodes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('code').unique()
      table.integer('percent', 3)
      table.integer('inviterId', 11)
      table.boolean('active').defaultTo(true)
      table.integer('used').defaultTo(0)
      table.integer('limit').defaultTo(null)

      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
