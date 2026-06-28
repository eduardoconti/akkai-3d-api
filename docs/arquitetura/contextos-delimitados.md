# Contextos delimitados e dependências

## Objetivo

Este documento define a propriedade dos conceitos do `akkai-3d` e as regras de
dependência entre módulos. Ele representa a arquitetura desejada para novas
alterações. Acoplamentos legados estão registrados no teste automatizado de
arquitetura e devem apenas diminuir.

## Contextos e responsabilidades

| Contexto      | Responsabilidades próprias                                                  | Não deve possuir                                   |
| ------------- | --------------------------------------------------------------------------- | -------------------------------------------------- |
| `auth`        | usuários, credenciais, sessões, papéis e permissões                         | regras comerciais ou financeiras                   |
| `produto`     | catálogo, categorias, estoque e movimentações                               | vendas, pagamentos ou assinaturas                  |
| `venda`       | vendas, feiras, preços por feira, pagamentos da venda e trocas              | cadastro de carteiras ou contabilização financeira |
| `financeiro`  | carteiras, despesas, taxas, ajustes e transferências                        | cadastro de feiras ou regras de venda              |
| `orcamento`   | propostas comerciais e seu ciclo de vida                                    | efetivação e persistência de vendas                |
| `assinatura`  | planos, assinantes, ciclos e kits mensais                                   | propriedade do catálogo de produtos                |
| `consignacao` | revendedores, remessas, saldos consignados, vendas e devoluções consignadas | propriedade de produto, estoque, venda ou carteira |
| `relatorio`   | modelos de leitura e consultas analíticas                                   | alteração dos agregados consultados                |
| `common`      | contratos e mecanismos realmente transversais                               | tipos pertencentes a um contexto de negócio        |

## Donos dos conceitos compartilhados

- `Produto` e saldo de estoque pertencem a `produto`.
- `Feira`, `Venda`, `TipoVenda` e preço praticado em feira pertencem a `venda`.
- `Carteira`, taxas e lançamentos financeiros pertencem a `financeiro`.
- `Orcamento` pertence a `orcamento`; `venda` apenas efetiva um orçamento por
  meio de um contrato de aplicação.
- A identidade autenticada pertence a `auth`. Outros contextos recebem somente
  um contrato mínimo com o identificador do usuário.
- `relatorio` pode ler dados de vários contextos, mas não expõe suas entidades
  nem executa comandos neles.

## Regras de dependência

1. Controllers dependem de casos de uso e tipos de apresentação.
2. Casos de uso dependem de contratos pequenos, nunca de controllers.
3. Repositórios TypeORM, `DataSource` e SQL são detalhes de infraestrutura.
4. Entidades e regras de domínio não devem depender de NestJS, HTTP, Swagger ou
   DTOs de entrada.
5. Um contexto referencia agregados externos por identificador e contrato, não
   por repositório ou service concreto do outro contexto.
6. Enums de negócio ficam no domínio, fora de arquivos de entidade TypeORM.
7. `common` não depende de nenhum contexto de negócio.
8. Relações físicas e chaves estrangeiras no PostgreSQL não autorizam uma
   dependência entre modelos de domínio.
9. Novas dependências entre contextos precisam ser representadas por portas de
   aplicação e registradas na composição do módulo NestJS.

## Contratos públicos permitidos

Durante a migração, cada módulo deve expor apenas contratos em uma pasta
`contracts/` ou portas em `application/ports/`. São contratos adequados:

- consultas de existência ou obtenção de dados mínimos;
- comandos que representam uma capacidade do contexto proprietário;
- tipos imutáveis sem decorators de framework;
- eventos de domínio ou integração.

Não são contratos públicos adequados:

- `Repository<T>`, `EntityManager` ou `DataSource`;
- services concretos;
- DTOs HTTP;
- entidades TypeORM completas;
- query builders.

## Dependências legadas conhecidas

A fase 3 eliminou as dependências diretas `common -> auth` e as dependências de
services concretos entre `financeiro` e `venda`. Consulta de feira, carteira e
taxa agora ocorre por contratos públicos mínimos. As principais exceções que
permanecem são:

- `venda -> produto`, para catálogo, preços e estoque;
- `venda -> orcamento`, para efetivar propostas comerciais;
- `consignacao -> venda/produto`, para orquestrar vendas e estoque consignado;
- casos de uso que ainda dependem de services concretos do próprio contexto;
- services que ainda recebem DTOs HTTP;
- entidades com relações TypeORM atravessando contextos.

Essas exceções não são precedentes para código novo. O teste
`src/arquitetura/arquitetura.spec.ts` mantém um orçamento máximo para cada uma.
Imports de `contracts/` e `enums/` públicos não contam como violação entre
contextos. Uma refatoração pode reduzir qualquer orçamento sem atualizar o
baseline. O baseline só deve ser aumentado após uma decisão arquitetural
registrada.

## Arquitetura interna pretendida

```text
contexto/
+-- dominio/          # entidades, value objects, enums e erros puros
+-- aplicacao/        # casos de uso, comandos, resultados e portas
+-- infraestrutura/   # TypeORM, SQL e integrações
+-- apresentacao/     # controllers, DTOs e Swagger
```

A estrutura atual não precisa ser movida de uma vez. Novos fluxos devem seguir
essa direção e fluxos existentes serão migrados por fatias verticais.
