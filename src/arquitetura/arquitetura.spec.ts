import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative, sep } from 'path';

const CONTEXTOS = new Set([
  'assinatura',
  'auth',
  'common',
  'consignacao',
  'financeiro',
  'orcamento',
  'produto',
  'relatorio',
  'venda',
]);

const ORCAMENTO_DEPENDENCIAS_CONTEXTO: Record<string, number> = {
  'assinatura->auth': 3,
  'assinatura->produto': 7,
  'consignacao->auth': 3,
  'consignacao->financeiro': 1,
  'consignacao->produto': 10,
  'consignacao->venda': 1,
  'financeiro->auth': 6,
  'financeiro->venda': 2,
  'orcamento->auth': 2,
  'orcamento->venda': 1,
  'produto->auth': 4,
  'produto->venda': 2,
  'relatorio->auth': 2,
  'venda->auth': 4,
  'venda->financeiro': 4,
  'venda->orcamento': 3,
  'venda->produto': 12,
};

const ORCAMENTO_VIOLACOES_CAMADAS: Record<string, number> = {
  'common depende de contexto de negócio': 0,
  'entidade depende de NestJS': 3,
  'DTO depende de arquivo de entidade': 0,
  'caso de uso depende de service concreto': 79,
  'service depende de DTO HTTP': 18,
  'importação de entidade cruza contexto': 35,
  'importação de service cruza contexto': 31,
};

type Importacao = {
  origem: string;
  contextoOrigem: string;
  contextoDestino?: string;
  especificador: string;
};

describe('Fronteiras arquiteturais', () => {
  const importacoes = coletarImportacoes();

  it('não adiciona dependências entre contextos além do baseline', () => {
    const contagens = contarDependenciasEntreContextos(importacoes);

    esperarDentroDoOrcamento(
      contagens,
      ORCAMENTO_DEPENDENCIAS_CONTEXTO,
      'dependência entre contextos',
    );
  });

  it('não aumenta violações de direção entre camadas', () => {
    const contagens = contarViolacoesDeCamadas(importacoes);

    esperarDentroDoOrcamento(
      contagens,
      ORCAMENTO_VIOLACOES_CAMADAS,
      'violação de camada',
    );
  });
});

function coletarImportacoes(): Importacao[] {
  const raizSrc = join(process.cwd(), 'src');
  const arquivos = listarArquivosTypeScript(raizSrc);

  return arquivos.flatMap((arquivo) => {
    const origem = relative(raizSrc, arquivo);
    const contextoOrigem = origem.split(sep)[0];

    if (!contextoOrigem || !CONTEXTOS.has(contextoOrigem)) {
      return [];
    }

    const conteudo = readFileSync(arquivo, 'utf8');
    const especificadores = Array.from(
      conteudo.matchAll(/(?:from\s+|import\s*)['"](@[^'"]+)['"]/g),
      (resultado) => resultado[1],
    ).filter((item): item is string => item !== undefined);

    return especificadores.map((especificador) => {
      const contextoDestino = especificador.match(/^@([^/]+)\//)?.[1];

      return {
        origem,
        contextoOrigem,
        contextoDestino,
        especificador,
      };
    });
  });
}

function listarArquivosTypeScript(diretorio: string): string[] {
  return readdirSync(diretorio).flatMap((nome) => {
    const caminho = join(diretorio, nome);

    if (statSync(caminho).isDirectory()) {
      return listarArquivosTypeScript(caminho);
    }

    return caminho.endsWith('.ts') && !caminho.endsWith('.spec.ts')
      ? [caminho]
      : [];
  });
}

function contarDependenciasEntreContextos(
  importacoes: Importacao[],
): Record<string, number> {
  const contagens: Record<string, number> = {};

  for (const importacao of importacoes) {
    if (
      !importacao.contextoDestino ||
      !CONTEXTOS.has(importacao.contextoDestino) ||
      importacao.contextoDestino === 'common' ||
      importacao.especificador.includes('/contracts') ||
      importacao.especificador.includes('/enums') ||
      importacao.contextoDestino === importacao.contextoOrigem
    ) {
      continue;
    }

    incrementar(
      contagens,
      `${importacao.contextoOrigem}->${importacao.contextoDestino}`,
    );
  }

  return contagens;
}

function contarViolacoesDeCamadas(
  importacoes: Importacao[],
): Record<string, number> {
  const contagens = Object.fromEntries(
    Object.keys(ORCAMENTO_VIOLACOES_CAMADAS).map((chave) => [chave, 0]),
  );

  for (const importacao of importacoes) {
    const ehContextoDestino =
      importacao.contextoDestino !== undefined &&
      CONTEXTOS.has(importacao.contextoDestino);
    const cruzaContexto =
      ehContextoDestino &&
      importacao.contextoDestino !== importacao.contextoOrigem;

    if (importacao.contextoOrigem === 'common' && cruzaContexto) {
      incrementar(contagens, 'common depende de contexto de negócio');
    }

    if (
      importacao.origem.includes(`${sep}entities${sep}`) &&
      importacao.especificador.startsWith('@nestjs/')
    ) {
      incrementar(contagens, 'entidade depende de NestJS');
    }

    if (
      importacao.origem.includes(`${sep}dto${sep}`) &&
      importacao.especificador.includes('/entities')
    ) {
      incrementar(contagens, 'DTO depende de arquivo de entidade');
    }

    if (
      importacao.origem.includes(`${sep}use-cases${sep}`) &&
      importacao.especificador.includes('/services')
    ) {
      incrementar(contagens, 'caso de uso depende de service concreto');
    }

    if (
      importacao.origem.includes(`${sep}services${sep}`) &&
      importacao.especificador.includes('/dto')
    ) {
      incrementar(contagens, 'service depende de DTO HTTP');
    }

    if (cruzaContexto && importacao.especificador.includes('/entities')) {
      incrementar(contagens, 'importação de entidade cruza contexto');
    }

    if (cruzaContexto && importacao.especificador.includes('/services')) {
      incrementar(contagens, 'importação de service cruza contexto');
    }
  }

  return contagens;
}

function incrementar(contagens: Record<string, number>, chave: string): void {
  contagens[chave] = (contagens[chave] ?? 0) + 1;
}

function esperarDentroDoOrcamento(
  contagens: Record<string, number>,
  orcamento: Record<string, number>,
  tipo: string,
): void {
  const excessos = Object.entries(contagens)
    .filter(([chave, quantidade]) => quantidade > (orcamento[chave] ?? 0))
    .map(([chave, quantidade]) => ({
      regra: chave,
      atual: quantidade,
      maximo: orcamento[chave] ?? 0,
    }));

  expect(excessos).toEqual([]);

  if (excessos.length > 0) {
    throw new Error(`Foi adicionada uma nova ${tipo}.`);
  }
}
