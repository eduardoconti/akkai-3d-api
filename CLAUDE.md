# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**akkai-3d** is a NestJS backend application built with TypeScript. It manages multiple business domains (sales, products, subscriptions, budgets, reports, financials) with a modular architecture and PostgreSQL database.

## Architecture

The application uses a **domain-driven modular structure**:

```
src/
├── auth/              # Authentication, JWT, users, roles, permissions
├── venda/             # Sales and market management
├── produto/           # Products and inventory
├── assinatura/        # Subscriptions and plans
├── orcamento/         # Budgets
├── relatorio/         # Reports
├── financeiro/        # Financial accounts and transactions
├── common/            # Shared utilities, filters, validation
├── config/            # Environment and database configuration
├── database/          # TypeORM migrations
└── app.module.ts      # Root module
```

Each domain module follows this internal structure:
- `controllers/` — HTTP endpoints
- `services/` — Business logic
- `use-cases/` — Specialized operations
- `entities/` — TypeORM database models
- `dto/` — Request/response schemas
- `docs/` — OpenAPI/Swagger definitions

## Common Commands

```bash
# Development
npm run start:dev          # Run in watch mode with UTC timezone
npm run start              # Start the application
npm run start:debug        # Start with debugger attached

# Building
npm run build              # Compile TypeScript to dist/
npm run start:prod         # Run compiled application (node dist/main)

# Code quality
npm run lint               # Run ESLint with auto-fix
npm run format             # Format code with Prettier
npm run test               # Run unit tests matching *.spec.ts
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage report
npm run test:debug         # Debug tests with Node inspector
npm run test:e2e           # Run end-to-end tests from test/ directory

# Run a single test file
npm run test -- auth/services/auth.service.spec.ts

# Run tests matching a pattern (e.g., all auth tests)
npm run test -- --testPathPattern="auth"

# NOTE: All tests automatically use maxWorkers=1 (configured in jest.config.js)
```

## Database

Uses **TypeORM** with **PostgreSQL**. Configuration is pulled from environment variables in `src/config/database.config.ts`.

**Migrations:**
```bash
npm run migration:create -- --name=<migration_name>   # Create a blank migration
npm run migration:generate -- --name=<migration_name>  # Generate from entity changes
npm run migration:run                                   # Apply pending migrations
npm run migration:revert                               # Undo last migration
npm run migration:show                                 # List applied migrations
```

All migrations go in `src/database/migrations/` and are auto-loaded by TypeORM.

## Environment Setup

The app validates required environment variables on startup using `src/config/env.validation.ts`. Copy `.env.example` (if provided) or create `.env` with:
- `NODE_ENV` (development | production)
- `PORT` (default 3000)
- `DATABASE_*` (host, port, username, password, name, ssl, synchronize, logging)
- `JWT_SECRET`, `JWT_EXPIRATION`
- `CORS_ORIGIN` (comma-separated list)

## Path Aliases

TypeScript path aliases are configured in `tsconfig.json` for clean imports:
```typescript
@auth/*       → src/auth/*
@common/*     → src/common/*
@financeiro/* → src/financeiro/*
@orcamento/*  → src/orcamento/*
@produto/*    → src/produto/*
@relatorio/*  → src/relatorio/*
@venda/*      → src/venda/*
@assinatura/* → src/assinatura/*
```

## Testing

- **Unit tests** use Jest; test files match `**/*.spec.ts`
- Jest config in `jest.config.js` with maxWorkers=1 enforced
- **ALL tests automatically run with maxWorkers=1** to prevent concurrency issues (shared resources, database access)
- Coverage reports ignore migrations, modules, config, and main.ts
- **E2E tests** use a separate config (`test/jest-e2e.json`) for files matching `*.e2e-spec.ts`

## Global Setup

- **Validation**: Global `ValidationPipe` with whitelist, transform, and custom error formatting
- **Exception handling**: Custom `ProblemDetailsExceptionFilter` for error responses
- **CORS**: Configured to accept specific origins and credentials
- **Swagger/OpenAPI**: Auto-generated from decorators; available at `/api/docs`
- **TypeORM entities**: Automatically registered from `src/config/database.config.ts`

## Code Quality Expectations

- Run `npm run lint` and `npm run format` after code changes
- Add or update tests whenever modifying code
- Run `npm run test` to ensure tests pass before committing

## Important: Claude Never Commits

**Claude will never create commits.** User retains full control of `git add` and `git commit`. This ensures:
- Complete visibility of what's being committed
- Prevention of accidentally committing incomplete work
- Full control over commit messages and grouping

See [`.clauderules`](.clauderules) for complete rules.

## Development Rules

Comprehensive development rules are documented in [`.clauderules`](.clauderules). Key points:

### Architecture & Naming
- **Always use path aliases** for imports: `@auth/*`, `@venda/*`, `@produto/*`, etc
- **Module structure**: Each domain has `controllers/`, `services/`, `use-cases/`, `entities/`, `dto/`, `docs/`
- **ALL code in Portuguese**: classes, methods, properties (Venda not Sale, criarPedido not createOrder)
- **Naming**: PascalCase entities (Venda, Produto), *Service/*Controller suffixes, VerbNounUseCase for use-cases

### Code Requirements
- **DTOs**: All DTOs MUST use `class-validator` decorators (@IsString, @IsNumber, etc)
- **Database**: Use TypeORM entities + repositories (never raw queries)
- **Exceptions**: Throw typed NestJS exceptions (NotFoundException, BadRequestException, etc)
- **Testing**: Write `.spec.ts` tests for every service and controller (80% coverage minimum)
- **Config**: Never hardcode values; use ConfigService from @nestjs/config
- **Async**: Use async/await (never .then() chains)
- **Design**: Follow OOP, SOLID (SRP, DIP, etc), and DRY principles — single responsibility per class, no code duplication

### SOLID & Design Principles
- **SRP**: One class = one reason to change (services ≠ controllers ≠ repositories)
- **DIP**: Depend on interfaces/abstractions, not concrete implementations
- **DRY**: No copy-paste code; extract to utilities, helpers, or base classes
- **OCP**: Open for extension (inheritance, interfaces), closed for modification

### Pre-Commit Checklist
Before every commit, verify:
- [ ] **Tests written for ALL new/modified public methods** (80% coverage minimum)
- [ ] **`npm run test` all passing** (no skipped or pending tests)
- [ ] **`npm run test:cov` coverage >= 80%** (90%+ for auth, venda, financeiro, produto)
- [ ] **ALL code in Portuguese** (classes, methods, properties - Venda not Sale)
- [ ] **Code follows SOLID & DRY** (no duplication, single responsibility per class)
- [ ] Path aliases used for all imports (@auth/*, @venda/*, etc)
- [ ] All DTOs have `class-validator` decorators
- [ ] **NEW ENTITIES added to `src/config/database.config.ts`** (if created new entity)
- [ ] `npm run lint` passed
- [ ] `npm run format` applied
- [ ] Migrations created (if schema changed)
- [ ] Swagger decorators on controllers
- [ ] No hardcoded configuration
- [ ] Commit message in Portuguese with type prefix (feat:, fix:, etc)

See [`.clauderules`](.clauderules) for complete guidelines including module-specific rules for auth, venda, produto, assinatura, and financeiro modules.
