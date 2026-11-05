import { HttpError } from '../errors.ts'

export interface Endereco {
  cep: string
  logradouro: string
  bairro: string
  cidade: string
  uf: string
}

export async function consultarCep(cep: string): Promise<Endereco> {
  let dados
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep.replace('-', '')}/json/`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!resposta.ok) throw new Error(`ViaCEP respondeu ${resposta.status}`)
    dados = await resposta.json()
  } catch (erro) {
    console.error(erro)
    throw new HttpError(502, 'Não foi possível consultar o ViaCEP')
  }

  if (dados.erro) throw new HttpError(404, `CEP ${cep} não encontrado`)

  return {
    cep: dados.cep,
    logradouro: dados.logradouro,
    bairro: dados.bairro,
    cidade: dados.localidade,
    uf: dados.uf,
  }
}

// Completa os dados do cliente com o endereço do CEP. Rua e bairro enviados
// pelo cliente têm prioridade sobre os do ViaCEP.
export async function preencherEndereco<T extends { cep: string; logradouro?: string; bairro?: string }>(dados: T) {
  const endereco = await consultarCep(dados.cep)
  return {
    ...dados,
    ...endereco,
    logradouro: dados.logradouro ?? endereco.logradouro,
    bairro: dados.bairro ?? endereco.bairro,
  }
}
