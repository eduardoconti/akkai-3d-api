import { applyDecorators } from '@nestjs/common';
import { ApiParam, ApiQuery } from '@nestjs/swagger';
import {
  TAMANHO_PAGINA_PADRAO,
  TAMANHOS_PAGINA_PERMITIDOS,
} from '@common/constants/paginacao.constants';

export function ApiPaginacaoQueryDocs(): MethodDecorator {
  return applyDecorators(
    ApiQuery({
      name: 'pagina',
      required: false,
      type: Number,
      example: 1,
      description: 'Página desejada da consulta paginada.',
    }),
    ApiQuery({
      name: 'tamanhoPagina',
      required: false,
      type: Number,
      example: TAMANHO_PAGINA_PADRAO,
      enum: TAMANHOS_PAGINA_PERMITIDOS,
      description: 'Quantidade de itens por página.',
    }),
    ApiQuery({
      name: 'termo',
      required: false,
      type: String,
      example: 'cubo',
      description: 'Texto livre para pesquisa.',
    }),
  );
}

export function ApiIdParamDocs(
  description: string,
  example = 1,
): MethodDecorator {
  return applyDecorators(
    ApiParam({
      name: 'id',
      type: Number,
      example,
      description,
    }),
  );
}
