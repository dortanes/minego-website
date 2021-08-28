import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Packs extends BaseSchema {
  protected tableName = 'packs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name')
      table.integer('amount')
      table.integer('icon')
      table.string('group')
      table.boolean('case').defaultTo(false)
      table.boolean('active').defaultTo(true)

      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
