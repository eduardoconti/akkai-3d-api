# AGENTS.md

This file provides guidance to Codex when working in this repository.

## Project Overview

`akkai-3d` is a NestJS backend application built with TypeScript. It manages
business domains such as authentication, sales, products, subscriptions,
budgets, reports, and financials using a modular architecture with PostgreSQL
and TypeORM.

## Architecture

The application uses a domain-driven modular structure:

```text
src/
+-- auth/              # Authentication, JWT, users, roles, permissions
+-- venda/             # Sales and market management
+-- produto/           # Products and inventory
+-- assinatura/        # Subscriptions and plans
+-- orcamento/         # Budgets
+-- relatorio/         # Reports
+-- financeiro/        # Financial accounts and transactions
+-- common/            # Shared utilities, filters, validation
+-- config/            # Environment and database configuration
+-- database/          # TypeORM migrations
+-- app.module.ts      # Root module
```

Each domain module should follow this internal structure:

- `controllers/`: HTTP endpoints.
- `services/`: business logic.
- `use-cases/`: specialized operations and complex workflows.
- `entities/`: TypeORM database models.
- `dto/`: request/response schemas.
- `docs/`: OpenAPI/Swagger definitions.

Services contain business logic, controllers handle HTTP only, use-cases
orchestrate complex flows, and modules should stay independent through explicit
NestJS imports/providers.

## Common Commands

```bash
# Development
npm run start:dev
npm run start
npm run start:debug

# Build
npm run build
npm run start:prod

# Code quality
npm run lint
npm run format
npm run test
npm run test:watch
npm run test:cov
npm run test:debug
npm run test:e2e

# Single test file
npm run test -- auth/services/auth.service.spec.ts

# Tests matching a pattern
npm run test -- --testPathPattern="auth"
```

All Jest tests use `maxWorkers=1` from `jest.config.js`; do not add a separate
worker flag unless the configuration changes.

## Database

The app uses TypeORM with PostgreSQL. Database configuration comes from
environment variables in `src/config/database.config.ts`.

```bash
npm run migration:create -- --name=<migration_name>
npm run migration:generate -- --name=<migration_name>
npm run migration:run
npm run migration:revert
npm run migration:show
```

Migrations belong in `src/database/migrations/` and are auto-loaded by TypeORM.
Create migrations for every schema change. Do not rely on `synchronize: true`
in production.

## Environment

Required environment variables are validated on startup in
`src/config/env.validation.ts`.

Expected values include:

- `NODE_ENV`
- `PORT`
- `DATABASE_*`
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `CORS_ORIGIN`

Never hardcode URLs, secrets, ports, paths, timeouts, or other configurable
values. Use `ConfigService` from `@nestjs/config`.

## Path Aliases

Always use TypeScript path aliases instead of long relative imports:

```text
@auth/*        -> src/auth/*
@common/*      -> src/common/*
@financeiro/*  -> src/financeiro/*
@orcamento/*   -> src/orcamento/*
@produto/*     -> src/produto/*
@relatorio/*   -> src/relatorio/*
@venda/*       -> src/venda/*
@assinatura/*  -> src/assinatura/*
```

Import order should be external libraries, then path aliases, then local files.
When adding modules, update both `tsconfig.json` paths and Jest
`moduleNameMapper` if needed.

## Language And Naming

All code identifiers should be in Portuguese. Do not mix English and Portuguese
inside the same file/class.

- Entities: PascalCase singular in Portuguese, such as `Venda`, `Produto`,
  `Assinante`, `Carteira`.
- Controllers: `*Controller`, such as `VendaController`.
- Services: `*Service`, such as `ProdutoService`.
- Use-cases: verb + noun + `UseCase`, such as `InserirVendaUseCase`,
  `AlterarFeiraUseCase`, `ExcluirVendaUseCase`.
- DTOs: `*Dto`, such as `CriarVendaDto` and `AtualizarProdutoDto`.
- Variables/properties: camelCase Portuguese, such as `nomeVenda`,
  `precoProduto`, `dataInicio`, `statusAtivo`.
- Methods: camelCase Portuguese starting with a verb, such as `criarVenda`,
  `obterPorId`, `alterarCarteira`, `listarPorFeira`, `validarEstoque`.
- Boolean methods/properties should start with `eh`, `tem`, or `pode`, such as
  `ehAtivo`, `temPermissao`, `podeExcluir`.
- Database columns: snake_case Portuguese, such as `nome_venda`,
  `preco_produto`, `data_inicio`.
- Comments and user-facing strings should be in Portuguese. Comments should
  explain why, not what.

## Design Principles

Follow OOP, SOLID, and DRY.

- SRP: one class, one reason to change.
- OCP: prefer extension through new classes, interfaces, providers, and base
  abstractions over modifying unrelated existing logic.
- LSP: subclasses and implementations must preserve their contracts.
- ISP: prefer small, specific interfaces over broad interfaces.
- DIP: depend on abstractions and use NestJS constructor injection.
- DRY: extract repeated logic to helpers, utilities, decorators, common modules,
  or base classes.

Keep controllers focused on HTTP, services focused on business logic, use-cases
focused on orchestration, repositories focused on data access, and
guards/filters focused on cross-cutting concerns.

## DTOs And Validation

- Every DTO must use `class-validator` decorators such as `@IsString()`,
  `@IsNumber()`, `@IsEmail()`, `@IsOptional()`, `@IsUUID()`, and `@IsArray()`.
- DTOs must not contain business logic.
- Add Swagger decorators such as `@ApiProperty()` for documented DTO fields.
- Validation messages should be user-friendly.

## TypeORM And Database Rules

- Use TypeORM entities and repositories. Do not use raw SQL for normal data
  access.
- Prefer TypeORM query builder for complex queries.
- Paginate list endpoints; never expose unbounded `SELECT *` behavior.
- Use lazy loading (`lazy: true`) for heavy relationships when appropriate.
- Foreign keys must define explicit `onDelete`, such as `CASCADE` or `SET NULL`.
- Add indexes for frequently queried fields.
- New entities must be added to the entities array in
  `src/config/database.config.ts`.
- Export entities from the module `index.ts` file when that pattern exists.

## Exceptions And Logging

- Throw typed NestJS exceptions, such as `NotFoundException`,
  `BadRequestException`, `ConflictException`, and related framework exceptions.
- Do not throw generic `Error` for expected API failures.
- Do not silently catch errors with empty `.catch()` handlers.
- Log errors with enough context for debugging.
- Do not leave `console.log()` in production code; use the project logger.

## Async Code

- Use `async`/`await`; avoid `.then()` chains.
- Do not forget `await` on async operations.
- Prefix intentionally unawaited promises with `void`.

## Swagger Documentation

- Add `@ApiOperation()` to endpoint methods.
- Add `@ApiResponse()` for success and error cases.
- Document DTO fields with `@ApiProperty()`.
- Keep Swagger documentation synchronized with controller behavior.
- Swagger is available at `/api/docs`.

## Testing

- Add or update `.spec.ts` tests for every new or modified service and
  controller.
- Cover all new or modified public methods.
- Test happy paths and error cases.
- Use `@nestjs/testing` with `Test.createTestingModule()`.
- Target at least 80% overall coverage.
- Critical modules (`auth`, `venda`, `financeiro`, `produto`) should stay at
  90%+ coverage.
- Run `npm run test` before finishing substantive code changes when feasible.
- Run `npm run test:cov` when coverage risk is meaningful.

## Global Setup

- Global validation uses `ValidationPipe` with whitelist, transform, and custom
  error formatting.
- Errors are formatted by `ProblemDetailsExceptionFilter`.
- CORS accepts configured origins and credentials.
- Swagger/OpenAPI is generated from decorators.
- TypeORM entities are registered from `src/config/database.config.ts`.

## Module-Specific Guidelines

### Auth

- Never log or expose JWT secrets.
- Password hashing uses bcrypt.
- Roles and permissions are checked through decorators.
- Refresh tokens are managed separately from access tokens.

### Venda

- Use use-cases for complex sales workflows such as inserir, alterar, and
  excluir.
- Keep `PrecoProdutoFeira` synchronization logic in services.
- Feira filtering is critical for venda listings.

### Produto

- `MovimentacaoEstoque` must be transactional.
- Validate `CategoriaProduto` hierarchy.
- Validate stock levels before sales.

### Assinatura

- Manage `CicloAssinatura` lifecycle carefully.
- Preserve `KitMensal` item relationships.
- Handle plan changes through use-cases.

### Financeiro

- Log `Carteira` transactions.
- Apply `TaxaMeioPagamentoCarteira` correctly.
- `Despesa` categorization is mandatory.

## Code Quality Checklist

Before handing off changes, verify as applicable:

- Tests exist for new/modified public methods.
- `npm run test` passes.
- `npm run test:cov` stays above target when coverage is relevant.
- Code identifiers are in Portuguese.
- SOLID and DRY principles are respected.
- Path aliases are used for imports.
- DTOs have `class-validator` decorators.
- New entities are registered in `src/config/database.config.ts`.
- `npm run lint` passes.
- `npm run format` has been applied when formatting changes are needed.
- Migrations exist for schema changes.
- Swagger decorators are present on new/modified endpoints.
- No hardcoded configuration values.
- No production `console.log()`.

## Git Rules

Codex must not create commits in this repository.

- Do not run `git commit`.
- Do not run `git add`.
- Prepare and verify changes, then leave staging and committing to the user.
- Commit messages, when the user writes them, should be in Portuguese with a
  type prefix such as `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, or
  `chore:`.
