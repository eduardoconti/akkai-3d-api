import { IsIn, IsOptional } from 'class-validator';
import { PesquisaPaginadaDto } from '../../common/dto/pesquisa-paginada.dto';

export class ObterValorProdutosEstoqueDto extends PesquisaPaginadaDto {
  @IsOptional()
  @IsIn(['codigo', 'nome', 'quantidade', 'valor', 'valorTotal'], {
    message:
      'A ordenação do relatório deve ser por código, nome, quantidade, valor ou valor total.',
  })
  ordenarPor?: 'codigo' | 'nome' | 'quantidade' | 'valor' | 'valorTotal' =
    'codigo';

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'A direção da ordenação deve ser asc ou desc.',
  })
  direcao?: 'asc' | 'desc' = 'asc';
}
