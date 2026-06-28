# ADR-003: contratos mínimos entre contextos

## Status

Aceita.

## Contexto

Financeiro registrava diretamente um service e uma entidade de Feira, enquanto
Venda e Consignação dependiam dos services concretos de Carteira e Taxa. Além
disso, `common` importava um tipo de autenticação e DTOs importavam enums
declarados em arquivos de entidade TypeORM.

Essas dependências expunham detalhes internos dos módulos, dificultavam testes
isolados e permitiam que uma alteração de persistência atravessasse vários
contextos.

## Decisão

- Capacidades consumidas por outro contexto são publicadas como classes
  abstratas pequenas na pasta `contracts/` do contexto proprietário.
- A composição NestJS liga o contrato ao service existente com `useExisting`,
  evitando duas instâncias do mesmo provider.
- Feira possui um módulo de composição próprio, usado por Venda e Financeiro;
  Financeiro recebe apenas `ConsultaFeira`.
- Financeiro exporta apenas `ConsultaCarteira` e `ConsultaTaxaPagamento` para os
  consumidores externos.
- O contexto do usuário atual em `common` conhece somente o identificador
  mínimo `sub`, sem importar o payload de `auth`.
- Enums de negócio ficam em `enums/`, fora das entidades TypeORM. Os barrels de
  entidades mantêm reexportações temporárias para compatibilidade com testes e
  consumidores existentes.
- Relações TypeORM cruzadas sem uso de navegação foram removidas, preservando as
  colunas de identificador e as chaves estrangeiras existentes.

## Consequências

Os módulos consumidores dependem de capacidades estáveis e dados mínimos. A
troca do mecanismo de persistência ou do service proprietário deixa de exigir
mudanças nesses consumidores.

Ainda permanecem relações TypeORM cruzadas usadas por consultas e fluxos
existentes, além de dependências concretas com Produto e Orçamento. Elas serão
tratadas por fatias verticais posteriores, sem ampliar o baseline automatizado.
