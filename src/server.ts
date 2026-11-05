import express, { type NextFunction, type Request, type Response } from 'express'
import { ZodError } from 'zod'
import { HttpError } from './errors.ts'
import { cepRoutes } from './routes/cep.ts'
import { clientesRoutes } from './routes/clientes.ts'
import { orcamentosRoutes } from './routes/orcamentos.ts'

const app = express()

app.use(express.json())

app.use('/api/cep', cepRoutes)
app.use('/api/clientes', clientesRoutes)
app.use('/api/orcamentos', orcamentosRoutes)

app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' })
})

// O Express 5 encaminha para cá os erros lançados nas rotas assíncronas.
app.use((erro: any, _req: Request, res: Response, _next: NextFunction) => {
  if (erro instanceof ZodError) {
    const detalhes = erro.issues.map((issue) => ({ campo: issue.path.join('.'), mensagem: issue.message }))
    res.status(400).json({ erro: 'Dados inválidos', detalhes })
  } else if (erro instanceof HttpError) {
    res.status(erro.status).json({ erro: erro.message })
  } else if (erro.status >= 400 && erro.status < 500) {
    // Erros de leitura do corpo da requisição, como um JSON malformado.
    res.status(erro.status).json({ erro: 'Corpo da requisição inválido' })
  } else {
    console.error(erro)
    res.status(500).json({ erro: 'Erro interno do servidor' })
  }
})

const porta = Number(process.env.PORT) || 3000
app.listen(porta, () => {
  console.log(`OrçaHub API rodando em http://localhost:${porta}`)
})
