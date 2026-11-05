# OrçaHub API

API para criar orçamentos de qualquer tipo de serviço. Cadastra clientes e preenche o endereço automaticamente a partir do CEP, usando o [ViaCEP](https://viacep.com.br).

Feita com Node.js, TypeScript, Express, Knex e PostgreSQL.

## Como rodar

Você precisa de Node.js 22 ou superior e de um servidor PostgreSQL em execução.

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo de configuração e preencha os dados do seu PostgreSQL. O usuário informado precisa ter permissão para criar bancos:

   ```bash
   cp .env.example .env
   ```

3. Inicie a API em `http://localhost:3000`:

   ```bash
   npm run dev
   ```

Na primeira execução, o banco e as tabelas são criados automaticamente. Nas seguintes, os dados existentes são mantidos. Para preparar o banco sem iniciar a API, use `npm run db:setup`.

Para testar, importe no Insomnia o arquivo `insomnia.json`, que já traz todas as requisições.

O diagrama de classes está em `diagrama-classes-orcahub.drawio`.

## Rotas

| Método | Rota                  | O que faz                                   |
| ------ | --------------------- | ------------------------------------------- |
| GET    | `/api/cep/:cep`       | Consulta um endereço pelo CEP               |
| GET    | `/api/clientes`       | Lista os clientes                           |
| POST   | `/api/clientes`       | Cadastra um cliente, com endereço pelo CEP  |
| GET    | `/api/clientes/:id`   | Busca um cliente                            |
| PUT    | `/api/clientes/:id`   | Atualiza um cliente                         |
| DELETE | `/api/clientes/:id`   | Remove um cliente e os orçamentos dele      |
| GET    | `/api/orcamentos`     | Lista os orçamentos                         |
| POST   | `/api/orcamentos`     | Cria um orçamento                           |
| GET    | `/api/orcamentos/:id` | Busca um orçamento                          |
| PUT    | `/api/orcamentos/:id` | Atualiza um orçamento                       |
| DELETE | `/api/orcamentos/:id` | Remove um orçamento                         |

## Exemplos

### Criar um orçamento cadastrando o cliente

Envie apenas o CEP. Rua, bairro, cidade e UF vêm do ViaCEP.

```http
POST /api/orcamentos
Content-Type: application/json

{
  "tipoServico": "Pintura residencial",
  "descricao": "Pintura interna de 3 cômodos",
  "valorCotado": 2500.00,
  "cliente": {
    "nome": "Maria Souza",
    "telefone": "(11) 91234-5678",
    "segmento": "RESIDENCIAL",
    "cep": "01001-000",
    "numero": "100"
  }
}
```

### Criar um orçamento para um cliente já cadastrado

```http
POST /api/orcamentos
Content-Type: application/json

{
  "clienteId": 1,
  "tipoServico": "Manutenção elétrica",
  "valorCotado": 800.00
}
```

## Campos com valores fixos

- `segmento` do cliente: `RESIDENCIAL`, `COMERCIAL`, `RURAL` ou `INDUSTRIAL`.
- `status` do orçamento: `ENVIADO` (padrão), `APROVADO` ou `RECUSADO`.

## CEP sem rua ou bairro

Alguns CEPs valem para a cidade inteira, e o ViaCEP não informa rua nem bairro neles. Nesse caso, envie `logradouro` e `bairro` junto com os dados do cliente.
