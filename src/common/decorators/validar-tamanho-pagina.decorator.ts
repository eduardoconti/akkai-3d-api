import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { TAMANHOS_PAGINA_PERMITIDOS } from '@common/constants/paginacao.constants';

export function ValidarTamanhoPagina(): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    Type(() => Number),
    IsInt({ message: 'O tamanho da página deve ser um número inteiro.' }),
    Min(1, { message: 'O tamanho da página deve ser maior que zero.' }),
    IsIn(TAMANHOS_PAGINA_PERMITIDOS, {
      message: 'O tamanho da página deve ser 25, 50 ou 100 itens.',
    }),
  );
}
