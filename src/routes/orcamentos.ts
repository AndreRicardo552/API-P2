import { Router } from 'express'
import { db } from '../db/connection.ts'
import { HttpError } from '../errors.ts'
import { atualizarOrcamentoSchema, criarOrcamentoSchema, idSchema } from '../schemas.ts'
import { preencherEndereco } from '../services/viacep.ts'

const NAO_ENCONTRADO = new HttpError(404, 'Orçamento não encontrado')

// Todo orçamento é devolvido com os dados do cliente embutidos.
const orcamentosComCliente = () =>
  db('orcamentos')
    .join('clientes', 'clientes.id', 'orcamentos.clienteId')
    .select('orcamentos.*', db.raw('to_json(clientes) as cliente'))

export const orcamentosRoutes = Router()

orcamentosRoutes.get('/', async (_req, res) => {
  res.json(await orcamentosComCliente().orderBy('orcamentos.id'))
})

// Aceita um cliente já cadastrado (clienteId) ou cadastra um novo junto (cliente).
orcamentosRoutes.post('/', async (req, res) => {
  const { cliente, clienteId, ...orcamento } = criarOrcamentoSchema.parse(req.body)

  if (clienteId && !(await db('clientes').where({ id: clienteId }).first())) {
    throw new HttpError(404, 'Cliente não encontrado')
  }
  const novoCliente = cliente && (await preencherEndereco(cliente))

  const id = await db.transaction(async (trx) => {
    const idDoCliente = novoCliente ? (await trx('clientes').insert(novoCliente).returning('id'))[0].id : clienteId
    const [criado] = await trx('orcamentos')
      .insert({ ...orcamento, clienteId: idDoCliente })
      .returning('id')
    return criado.id
  })

  res.status(201).json(await orcamentosComCliente().where('orcamentos.id', id).first())
})

orcamentosRoutes.get('/:id', async (req, res) => {
  const orcamento = await orcamentosComCliente().where('orcamentos.id', idSchema.parse(req.params.id)).first()
  if (!orcamento) throw NAO_ENCONTRADO
  res.json(orcamento)
})

orcamentosRoutes.put('/:id', async (req, res) => {
  const id = idSchema.parse(req.params.id)
  const atualizados = await db('orcamentos').where({ id }).update(atualizarOrcamentoSchema.parse(req.body))
  if (!atualizados) throw NAO_ENCONTRADO
  res.json(await orcamentosComCliente().where('orcamentos.id', id).first())
})

orcamentosRoutes.delete('/:id', async (req, res) => {
  const removidos = await db('orcamentos').where({ id: idSchema.parse(req.params.id) }).del()
  if (!removidos) throw NAO_ENCONTRADO
  res.status(204).end()
})
