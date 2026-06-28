# ADR-002 — Adiar controle de concorrência em consignação

## Status

Aceita em 27 de junho de 2026.

## Contexto

As operações de venda e devolução consignada consultam e validam o saldo antes
de iniciar a transação de escrita. Requisições simultâneas podem consumir o
mesmo saldo e produzir uma quantidade vendida ou devolvida acima da disponível.

O sistema é utilizado atualmente por três pessoas e operações simultâneas sobre
a mesma consignação são raras.

## Decisão

Adiar a Fase 1 do plano de refatoração e aceitar temporariamente o risco de
corrida. A Fase 2 pode prosseguir sem alterar o comportamento transacional.

## Consequências

- O risco de inconsistência permanece conhecido e aceito.
- Não deve ser removido do backlog nem descrito como resolvido.
- Aumentar o número de usuários, automatizar vendas ou integrar novos canais
  exige revisar esta decisão.
- Caso ocorra saldo negativo ou divergência de consignação, a prioridade desta
  correção deve ser elevada imediatamente.

## Gatilhos para revisão

- mais de três usuários operacionais;
- uso simultâneo frequente;
- integração com e-commerce, aplicativo ou importação em lote;
- primeira ocorrência de inconsistência de saldo;
- necessidade de auditoria financeira mais rigorosa.

## Solução adiada

Mover leitura, validação e escrita para uma única transação e aplicar lock
pessimista ou versionamento otimista nos itens de consignação.
