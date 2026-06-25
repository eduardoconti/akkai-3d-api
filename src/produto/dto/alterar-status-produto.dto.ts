import { IsEnum } from 'class-validator';
import { StatusProduto } from '@produto/entities';

export class AlterarStatusProdutoDto {
  @IsEnum(StatusProduto, {
    message: 'O status do produto deve ser ATIVO ou INATIVO.',
  })
  status!: StatusProduto;
}
