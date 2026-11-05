import { Router } from 'express'
import { cepSchema } from '../schemas.ts'
import { consultarCep } from '../services/viacep.ts'

export const cepRoutes = Router()

cepRoutes.get('/:cep', async (req, res) => {
  res.json(await consultarCep(cepSchema.parse(req.params.cep)))
})
