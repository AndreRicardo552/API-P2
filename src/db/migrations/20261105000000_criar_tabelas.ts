import type { Knex } from 'knex'

export async function up(knex: Knex) {
  await knex.schema.createTable('clientes', (t) => {
    t.increments('id')
    t.text('nome').notNullable()
    t.text('telefone').notNullable()
    t.enu('segmento', ['RESIDENCIAL', 'COMERCIAL', 'RURAL', 'INDUSTRIAL']).notNullable()
    t.text('cep').notNullable()
    t.text('logradouro').notNullable()
    t.text('numero')
    t.text('complemento')
    t.text('bairro').notNullable()
    t.text('cidade').notNullable()
    t.text('uf').notNullable()
  })

  await knex.schema.createTable('orcamentos', (t) => {
    t.increments('id')
    t.integer('clienteId').notNullable().references('clientes.id').onDelete('CASCADE')
    t.text('tipoServico').notNullable()
    t.text('descricao')
    t.decimal('valorCotado', 12, 2).notNullable()
    t.enu('status', ['ENVIADO', 'APROVADO', 'RECUSADO']).notNullable().defaultTo('ENVIADO')
    t.timestamp('dataCriacao').notNullable().defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex) {
  await knex.schema.dropTable('orcamentos')
  await knex.schema.dropTable('clientes')
}
