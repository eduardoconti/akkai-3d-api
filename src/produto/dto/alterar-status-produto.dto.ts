import { IsEnum } from 'class-validator';
import { StatusProduto } from '@produto/enums';

export class AlterarStatusProdutoDto {
  @IsEnum(StatusProduto, {
    message: 'O status do produto deve ser ATIVO ou INATIVO.',
  })
  status!: StatusProduto;
}
