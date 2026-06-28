import { IsArray, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransformarListaNumerica } from '@common/decorators/transformar-lista.decorator';
import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';

export class PesquisarProdutosDto extends PesquisaPaginadaDto {
  @ApiPropertyOptional({
    default: 'nome',
    enum: ['nome', 'codigo', 'nivelEstoque'],
  })
  @IsOptional()
  @IsIn(['nome', 'codigo', 'nivelEstoque'], {
    message:
      'A ordenação dos produtos deve ser por nome, código ou nível de estoque.',
  })
  ordenarPor?: 'nome' | 'codigo' | 'nivelEstoque' = 'nome';

  @ApiPropertyOptional({ default: 'asc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'A direção da ordenação deve ser asc ou desc.',
  })
  direcao?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({ type: Number, isArray: true })
  @IsOptional()
  @TransformarListaNumerica()
  @IsArray({
    message: 'As categorias devem ser informadas em formato de lista.',
  })
  @IsInt({ each: true, message: 'Cada categoria deve ser um número inteiro.' })
  @Min(1, {
    each: true,
    message: 'Cada categoria deve ser maior que zero.',
  })
  idsCategorias?: number[];
}
