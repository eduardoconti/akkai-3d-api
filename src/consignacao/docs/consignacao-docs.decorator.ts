import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
} from '@nestjs/swagger';
import {
  AlterarItemConsignacaoDto,
  AlterarRevendedorDto,
  InserirConsignacaoDto,
  InserirItemConsignacaoDto,
  InserirRevendedorDto,
  RegistrarMovimentoConsignacaoDto,
  RegistrarVendasConsignadasDto,
} from '@consignacao/dto';
import {
  ApiNotFoundErrorResponse,
  ApiUnauthorizedErrorResponse,
  ApiValidationErrorResponse,
} from '@common/docs/decorators/api-default-problem-responses.decorator';
import {
  ApiIdParamDocs,
  ApiPaginacaoQueryDocs,
} from '@common/docs/decorators/api-query-docs.decorator';

export function ApiInserirRevendedorDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Cadastra um revendedor.' }),
    ApiBody({ type: InserirRevendedorDto }),
    ApiCreatedResponse({ description: 'Revendedor criado com sucesso.' }),
    ApiValidationErrorResponse('/consignacao/revendedores'),
    ApiUnauthorizedErrorResponse('/consignacao/revendedores'),
  );
}

export function ApiListarRevendedoresDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Lista revendedores cadastrados.' }),
    ApiPaginacaoQueryDocs(),
    ApiOkResponse({ description: 'Revendedores encontrados com sucesso.' }),
    ApiUnauthorizedErrorResponse('/consignacao/revendedores'),
  );
}

export function ApiObterRevendedorPorIdDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtém um revendedor pelo identificador.' }),
    ApiIdParamDocs('Identificador do revendedor.'),
    ApiOkResponse({ description: 'Revendedor encontrado com sucesso.' }),
    ApiNotFoundErrorResponse(
      '/consignacao/revendedores/1',
      'Revendedor não encontrado.',
    ),
    ApiUnauthorizedErrorResponse('/consignacao/revendedores/1'),
  );
}

export function ApiAlterarRevendedorDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Altera os dados cadastrais de um revendedor.' }),
    ApiIdParamDocs('Identificador do revendedor.'),
    ApiBody({ type: AlterarRevendedorDto }),
    ApiOkResponse({ description: 'Revendedor alterado com sucesso.' }),
    ApiValidationErrorResponse('/consignacao/revendedores/1'),
    ApiNotFoundErrorResponse(
      '/consignacao/revendedores/1',
      'Revendedor não encontrado.',
    ),
    ApiUnauthorizedErrorResponse('/consignacao/revendedores/1'),
  );
}

export function ApiInserirConsignacaoDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registra uma remessa de peças em consignação.',
      description:
        'Baixa o estoque próprio dos produtos enviados e cria o controle de saldo com o revendedor.',
    }),
    ApiBody({ type: InserirConsignacaoDto }),
    ApiCreatedResponse({ description: 'Consignação criada com sucesso.' }),
    ApiValidationErrorResponse('/consignacao'),
    ApiUnauthorizedErrorResponse('/consignacao'),
  );
}

export function ApiListarConsignacoesDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Lista consignações registradas.' }),
    ApiPaginacaoQueryDocs(),
    ApiOkResponse({ description: 'Consignações encontradas com sucesso.' }),
    ApiUnauthorizedErrorResponse('/consignacao'),
  );
}

export function ApiObterConsignacaoPorIdDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtém uma consignação com seus itens.' }),
    ApiIdParamDocs('Identificador da consignação.'),
    ApiOkResponse({ description: 'Consignação encontrada com sucesso.' }),
    ApiNotFoundErrorResponse('/consignacao/1', 'Consignação não encontrada.'),
    ApiUnauthorizedErrorResponse('/consignacao/1'),
  );
}

export function ApiAdicionarItemConsignacaoDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Adiciona um item a uma consignação aberta.',
      description:
        'Baixa o estoque próprio do produto adicionado e atualiza o saldo da consignação.',
    }),
    ApiBody({ type: InserirItemConsignacaoDto }),
    ApiOkResponse({ description: 'Item adicionado com sucesso.' }),
    ApiValidationErrorResponse('/consignacao/1/itens'),
    ApiNotFoundErrorResponse(
      '/consignacao/1/itens',
      'Consignação não encontrada.',
    ),
    ApiUnauthorizedErrorResponse('/consignacao/1/itens'),
  );
}

export function ApiAlterarItemConsignacaoDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Altera um item de uma consignação aberta.',
      description:
        'Ajusta quantidade enviada e valor unitário, movimentando estoque pela diferença de quantidade.',
    }),
    ApiBody({ type: AlterarItemConsignacaoDto }),
    ApiOkResponse({ description: 'Item alterado com sucesso.' }),
    ApiValidationErrorResponse('/consignacao/1/itens/1'),
    ApiNotFoundErrorResponse(
      '/consignacao/1/itens/1',
      'Item de consignação não encontrado.',
    ),
    ApiUnauthorizedErrorResponse('/consignacao/1/itens/1'),
  );
}

export function ApiExcluirItemConsignacaoDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Exclui um item de uma consignação aberta.',
      description:
        'Devolve ao estoque próprio a quantidade enviada quando o item ainda não possui venda ou devolução registrada.',
    }),
    ApiOkResponse({ description: 'Item excluído com sucesso.' }),
    ApiNotFoundErrorResponse(
      '/consignacao/1/itens/1',
      'Item de consignação não encontrado.',
    ),
    ApiUnauthorizedErrorResponse('/consignacao/1/itens/1'),
  );
}

export function ApiRelatorioConsignacaoPdfDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Gera o relatório PDF de uma consignação.',
      description:
        'Emite a lista de peças consignadas com valores unitários, desconto aplicado e totais.',
    }),
    ApiProduces('application/pdf'),
    ApiOkResponse({ description: 'PDF da consignação gerado com sucesso.' }),
    ApiNotFoundErrorResponse(
      '/consignacao/1/pdf',
      'Consignação não encontrada.',
    ),
    ApiUnauthorizedErrorResponse('/consignacao/1/pdf'),
  );
}

export function ApiRegistrarVendasRevendedorConsignadoDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registra vendas consignadas pelo revendedor.',
      description:
        'Lança a lista semanal de produtos vendidos e baixa automaticamente das consignações abertas mais antigas do revendedor.',
    }),
    ApiBody({ type: RegistrarVendasConsignadasDto }),
    ApiOkResponse({
      description: 'Vendas consignadas do revendedor registradas com sucesso.',
    }),
    ApiValidationErrorResponse('/consignacao/revendedores/1/vendas'),
    ApiUnauthorizedErrorResponse('/consignacao/revendedores/1/vendas'),
  );
}

export function ApiRegistrarDevolucaoConsignadaDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Registra devolução de um item consignado.' }),
    ApiBody({ type: RegistrarMovimentoConsignacaoDto }),
    ApiOkResponse({
      description: 'Devolução consignada registrada com sucesso.',
    }),
    ApiValidationErrorResponse('/consignacao/1/itens/1/devolucoes'),
    ApiUnauthorizedErrorResponse('/consignacao/1/itens/1/devolucoes'),
  );
}
