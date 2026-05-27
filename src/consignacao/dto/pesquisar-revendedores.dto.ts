import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsIn } from 'class-validator';
import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';
import { StatusRevendedor } from '@consignacao/entities';

export class PesquisarRevendedoresDto extends PesquisaPaginadaDto {
  @ApiPropertyOptional({
    enum: StatusRevendedor,
    description: 'Filtra revendedores por status.',
  })
  @IsOptional()
  @IsEnum(StatusRevendedor, {
    message: `O status do revendedor deve ser um dos valores: ${Object.values(StatusRevendedor).join(', ')}.`,
  })
  status?: StatusRevendedor;

  @ApiPropertyOptional({
    enum: ['nome', 'dataInclusao'],
    description: 'Campo utilizado para ordenação.',
  })
  @IsOptional()
  @IsIn(['nome', 'dataInclusao'], {
    message: 'A ordenação deve ser por nome ou dataInclusao.',
  })
  ordenarPor?: 'nome' | 'dataInclusao' = 'nome';
}
