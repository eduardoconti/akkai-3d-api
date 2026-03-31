import { IsEnum, IsOptional } from 'class-validator';
import { PesquisaPaginadaDto } from '../../common/dto/pesquisa-paginada.dto';
import { TipoVenda } from '@venda/entities';

export class PesquisarVendasDto extends PesquisaPaginadaDto {
  @IsOptional()
  @IsEnum(TipoVenda, {
    message: 'O tipo da venda deve ser FEIRA, LOJA ou ONLINE.',
  })
  tipo?: TipoVenda;
}
