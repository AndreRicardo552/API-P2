import { Router } from 'express'
import { db } from '../db/connection.ts'
import { HttpError } from '../errors.ts'
import { atualizarClienteSchema, clienteSchema, idSchema } from '../schemas.ts'
import { preencherEndereco } from '../services/viacep.ts'

const NAO_ENCONTRADO = new HttpError(404, 'Cliente não encontrado')

export const clientesRoutes = Router()

clientesRoutes.get('/', async (_req, res) => {
  res.json(await db('clientes').orderBy('id'))
})

clientesRoutes.post('/', async (req, res) => {
  const dados = await preencherEndereco(clienteSchema.parse(req.body))
  const [cliente] = await db('clientes').insert(dados).returning('*')
  res.status(201).json(cliente)
})

clientesRoutes.get('/:id', async (req, res) => {
  const cliente = await db('clientes').where({ id: idSchema.parse(req.params.id) }).first()
  if (!cliente) throw NAO_ENCONTRADO
  res.json(cliente)
})

clientesRoutes.put('/:id', async (req, res) => {
  const id = idSchema.parse(req.params.id)
  const dados = atualizarClienteSchema.parse(req.body)
  // O endereço só é consultado de novo quando o CEP muda.
  const alteracoes = dados.cep ? await preencherEndereco({ ...dados, cep: dados.cep }) : dados
  const [cliente] = await db('clientes').where({ id }).update(alteracoes).returning('*')
  if (!cliente) throw NAO_ENCONTRADO
  res.json(cliente)
})

clientesRoutes.delete('/:id', async (req, res) => {
  const removidos = await db('clientes').where({ id: idSchema.parse(req.params.id) }).del()
  if (!removidos) throw NAO_ENCONTRADO
  res.status(204).end()
})
