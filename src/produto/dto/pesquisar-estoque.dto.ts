import { IsIn, IsOptional } from 'class-validator';
import { PesquisaPaginadaDto } from '../../common/dto/pesquisa-paginada.dto';

export class PesquisarEstoqueDto extends PesquisaPaginadaDto {
  @IsOptional()
  @IsIn(['nome', 'codigo', 'quantidade', 'nivelEstoque'], {
    message:
      'A ordenação do estoque deve ser por nome, código, quantidade ou nível do estoque.',
  })
  ordenarPor?: 'nome' | 'codigo' | 'quantidade' | 'nivelEstoque' = 'nome';

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'A direção da ordenação deve ser asc ou desc.',
  })
  direcao?: 'asc' | 'desc' = 'asc';
}
