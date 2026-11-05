import { z } from 'zod'

z.config(z.locales.ptBR())

const texto = z.string().trim().min(1)
const naoVazio = (dados: object) => Object.keys(dados).length > 0
const MENSAGEM_VAZIO = 'Informe ao menos um campo para atualizar'

// Limite do tipo integer do PostgreSQL.
export const idSchema = z.coerce.number().int().positive().max(2147483647)

export const cepSchema = z.string().regex(/^\d{5}-?\d{3}$/, 'CEP deve ter 8 dígitos (ex.: 01001-000)')

export const clienteSchema = z.object({
  nome: texto,
  telefone: texto,
  segmento: z.enum(['RESIDENCIAL', 'COMERCIAL', 'RURAL', 'INDUSTRIAL']),
  cep: cepSchema,
  numero: texto.optional(),
  complemento: texto.optional(),
  // Preenchidos pelo ViaCEP. Só precisam ser enviados quando o CEP é geral da
  // cidade, caso em que o ViaCEP não informa rua nem bairro.
  logradouro: texto.optional(),
  bairro: texto.optional(),
})

export const atualizarClienteSchema = clienteSchema.partial().refine(naoVazio, MENSAGEM_VAZIO)

const camposOrcamento = z.object({
  tipoServico: texto,
  descricao: texto.optional(),
  // Limite da coluna decimal(12, 2).
  valorCotado: z.number().nonnegative().max(9999999999.99),
  status: z.enum(['ENVIADO', 'APROVADO', 'RECUSADO']).optional(),
})

export const criarOrcamentoSchema = camposOrcamento
  .extend({
    clienteId: idSchema.optional(),
    cliente: clienteSchema.optional(),
  })
  .refine((dados) => !dados.clienteId !== !dados.cliente, {
    message: 'Informe clienteId (cliente existente) ou cliente (novo cadastro), apenas um deles',
  })

export const atualizarOrcamentoSchema = camposOrcamento.partial().refine(naoVazio, MENSAGEM_VAZIO)
