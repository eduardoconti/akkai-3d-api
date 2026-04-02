import { applyDecorators } from '@nestjs/common';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

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
      example: 10,
      description: 'Quantidade máxima de itens por página.',
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
