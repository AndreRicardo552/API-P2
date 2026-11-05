// Cria o banco definido no .env (se ainda não existir) e aplica as migrations.
import knex from 'knex'
import { db, dbConfig } from './connection.ts'

const admin = knex({ client: 'pg', connection: { ...dbConfig, database: 'postgres' } })

const existente = await admin.raw('select 1 from pg_database where datname = ?', [dbConfig.database])
if (existente.rowCount === 0) {
  await admin.raw('create database ??', [dbConfig.database])
  console.log(`Banco "${dbConfig.database}" criado.`)
}
await admin.destroy()

const [, aplicadas] = await db.migrate.latest({ directory: `${import.meta.dirname}/migrations` })
console.log(aplicadas.length ? `Migrations aplicadas: ${aplicadas.join(', ')}` : 'Nenhuma migration pendente.')
await db.destroy()
