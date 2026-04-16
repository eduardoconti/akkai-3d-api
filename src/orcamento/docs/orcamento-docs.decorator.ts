import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AtualizarOrcamentoDto, InserirOrcamentoDto } from '@orcamento/dto';
import {
  ApiNotFoundErrorResponse,
  ApiUnauthorizedErrorResponse,
  ApiValidationErrorResponse,
} from '@common/docs/decorators/api-default-problem-responses.decorator';
import {
  ApiIdParamDocs,
  ApiPaginacaoQueryDocs,
} from '@common/docs/decorators/api-query-docs.decorator';

const ORCAMENTO_EXEMPLO = {
  id: 1,
  nomeCliente: 'Eduardo',
  telefoneCliente: '11999999999',
  tipo: 'FEIRA',
  status: 'PENDENTE',
  idFeira: 1,
  feira: { id: 1, nome: 'MAUA', local: 'Praça Mauá', ativa: true },
  valor: 5000,
  quantidade: 2,
  descricao: 'Cubo infinito personalizado',
  linkSTL: 'https://storage.example.com/modelo.stl',
  dataInclusao: '2026-04-16T10:00:00.000Z',
};

export function ApiInserirOrcamentoDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registra um novo orçamento.',
      description:
        'Cria um orçamento para um cliente com tipo, feira opcional, valor estimado, quantidade e link do modelo STL.',
    }),
    ApiBody({
      type: InserirOrcamentoDto,
      examples: {
        feira: {
          summary: 'Orçamento para feira',
          value: {
            nomeCliente: 'Eduardo',
            telefoneCliente: '11999999999',
            tipo: 'FEIRA',
            idFeira: 1,
            valor: 5000,
            quantidade: 2,
            descricao: 'Cubo infinito personalizado',
            linkSTL: 'https://storage.example.com/modelo.stl',
          },
        },
        online: {
          summary: 'Orçamento online',
          value: {
            nomeCliente: 'Maria',
            tipo: 'ONLINE',
            descricao: 'Peça personalizada',
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Orçamento criado com sucesso.',
      schema: { example: ORCAMENTO_EXEMPLO },
    }),
    ApiValidationErrorResponse('/orcamento'),
    ApiUnauthorizedErrorResponse('/orcamento'),
  );
}

export function ApiAtualizarOrcamentoDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualiza um orçamento existente.',
      description:
        'Permite alterar dados do orçamento como status, valor, quantidade, descrição e link STL.',
    }),
    ApiIdParamDocs('Identificador do orçamento a ser atualizado.'),
    ApiBody({
      type: AtualizarOrcamentoDto,
      examples: {
        padrao: {
          summary: 'Atualização válida',
          value: {
            status: 'APROVADO',
            valor: 6000,
            quantidade: 3,
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Orçamento atualizado com sucesso.',
      schema: {
        example: {
          ...ORCAMENTO_EXEMPLO,
          status: 'APROVADO',
          valor: 6000,
          quantidade: 3,
        },
      },
    }),
    ApiValidationErrorResponse('/orcamento/1'),
    ApiUnauthorizedErrorResponse('/orcamento/1'),
    ApiNotFoundErrorResponse('/orcamento/999', 'Orçamento não encontrado.'),
  );
}

export function ApiListarOrcamentosDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista orçamentos com paginação.',
      description:
        'Retorna orçamentos paginados em ordem decrescente de data de inclusão, com a feira vinculada quando aplicável.',
    }),
    ApiPaginacaoQueryDocs(),
    ApiOkResponse({
      description: 'Orçamentos encontrados com sucesso.',
      schema: {
        example: {
          pagina: 1,
          tamanhoPagina: 10,
          totalItens: 1,
          totalPaginas: 1,
          itens: [ORCAMENTO_EXEMPLO],
        },
      },
    }),
    ApiValidationErrorResponse('/orcamento'),
    ApiUnauthorizedErrorResponse('/orcamento'),
  );
}
