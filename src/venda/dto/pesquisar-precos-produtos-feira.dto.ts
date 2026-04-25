import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';

export class PesquisarPrecosProdutosFeiraDto extends PesquisaPaginadaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A feira deve ser um número inteiro.' })
  @Min(1, { message: 'A feira deve ser maior que zero.' })
  @Max(2147483647, {
    message: 'A feira ultrapassa o limite permitido.',
  })
  idFeira?: number;

  @IsOptional()
  @IsIn(['codigo', 'nome', 'valor', 'feira'], {
    message:
      'A ordenação dos preços deve ser por código, nome, valor ou feira.',
  })
  ordenarPor?: 'codigo' | 'nome' | 'valor' | 'feira' = 'codigo';

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'A direção da ordenação deve ser asc ou desc.',
  })
  direcao?: 'asc' | 'desc' = 'asc';
}
