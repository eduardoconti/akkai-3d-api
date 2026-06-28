# Baseline de qualidade — Fase 0

Data de referência: 27 de junho de 2026.

## Estado inicial

- Build TypeScript: aprovado.
- Testes unitários: 112 suítes e 667 testes aprovados.
- Tempo da suíte antes da Fase 0: 21,872 segundos.
- Testes E2E: um cenário, restrito ao endpoint raiz.
- Verificação arquitetural: inexistente antes desta fase.

## Resultado após a Fase 0

- Build TypeScript: aprovado.
- Lint sem escrita: aprovado e sem avisos.
- Testes: 114 suítes e 677 testes aprovados.
- Tempo da suíte completa: 18,266 segundos.
- Cobertura: 88,21% de statements, 73,32% de branches, 70,48% de functions e
  88,83% de lines.
- Tempo da suíte com cobertura: 29,923 segundos.
- Testes de arquitetura: duas regras aprovadas.

O `coverageThreshold` do Jest usa os valores inteiros imediatamente abaixo do
baseline: 88% de statements, 73% de branches, 70% de functions e 88% de lines.
Assim, `npm run test:cov` impede regressões globais sem arredondar o resultado
para cima e criar uma falha artificial no próprio baseline.

## Fluxos protegidos por caracterização

| Fluxo                            | Proteção atual                                                                         |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| Inserção de venda                | preço, desconto, pagamentos, taxas, imposto, estoque, feira e finalização de orçamento |
| Consignação                      | consumo FIFO, saldo, venda, devolução e movimentação de estoque                        |
| Orçamento                        | filtros, paginação e transição para finalizado                                         |
| Relatórios                       | SQL e mapeamento dos relatórios públicos com `DataSource` simulado                     |
| Autenticação                     | cadastro, login, refresh, logout, perfil e senha                                       |
| Parsing de pesquisa de orçamento | normalização de status único, CSV e array, além de rejeição de valores inválidos       |

Os testes atuais caracterizam o comportamento em memória. Eles não comprovam
isolamento transacional, locks, migrations ou compatibilidade do SQL com uma
versão real do PostgreSQL.

## Baseline de consultas

Ainda não existe um banco de referência com volume e distribuição de dados
estáveis. Registrar tempos absolutos em mocks produziria um número enganoso.
Até a criação desse ambiente, o baseline de consultas é estrutural:

- `RelatorioService` executa consultas SQL diretas para oito endpoints;
- listagens paginadas normalmente executam uma consulta de itens e outra de
  totalizadores/contagem;
- nenhuma consulta crítica possui hoje teste com `EXPLAIN (ANALYZE, BUFFERS)`;
- nenhuma regressão de duração é bloqueada automaticamente.

Para tornar o baseline temporal comparável, o ambiente de performance deverá:

1. usar PostgreSQL na mesma versão da produção;
2. restaurar uma massa anonimizada e versionada;
3. aquecer cache e executar cada consulta ao menos cinco vezes;
4. registrar mediana, p95, linhas retornadas e buffers lidos;
5. armazenar o plano de execução junto do resultado;
6. falhar somente diante de regressão estatisticamente relevante.

Até isso existir, mudanças em SQL crítico exigem teste de integração e revisão
do plano de execução, sem prometer um limite artificial em milissegundos.

## Comandos de verificação

```bash
npm run test:architecture
npm run test:cov
npm run verify
```

`npm run verify` não altera arquivos. O comando `npm run lint` continua sendo a
variante que aplica correções automaticamente.
