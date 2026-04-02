import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ResultadoPaginadoDto } from '../dto/resultado-paginado.dto';

export function ApiPaginatedOkResponse<TModel extends Type<unknown>>(
  model: TModel,
  description: string,
  example: Record<string, unknown>,
): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(ResultadoPaginadoDto, model),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResultadoPaginadoDto) },
          {
            properties: {
              itens: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
        example,
      },
    }),
  );
}
