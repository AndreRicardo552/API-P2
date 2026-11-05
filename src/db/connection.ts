import dotenv from 'dotenv'
import knex from 'knex'
import pg from 'pg'

dotenv.config({ quiet: true })

// Por padrão o pg devolve colunas decimal como string; a API trabalha com número.
pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat)

export const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? 'orcahub',
}

export const db = knex({ client: 'pg', connection: dbConfig })
