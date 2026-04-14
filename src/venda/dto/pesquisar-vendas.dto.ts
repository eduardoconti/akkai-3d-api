import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { TipoVenda } from '@venda/entities';

export class PesquisarVendasDto extends PesquisaPaginadaDto {
  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'A data inicial deve estar em um formato de data válido.',
    },
  )
  dataInicio?: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'A data final deve estar em um formato de data válido.',
    },
  )
  dataFim?: string;

  @IsOptional()
  @IsEnum(TipoVenda, {
    message: 'O tipo da venda deve ser FEIRA, LOJA ou ONLINE.',
  })
  tipo?: TipoVenda;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A feira deve ser um número inteiro.' })
  @Min(1, { message: 'A feira deve ser maior que zero.' })
  idFeira?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A carteira deve ser um número inteiro.' })
  @Min(1, { message: 'A carteira deve ser maior que zero.' })
  idCarteira?: number;

  @IsOptional()
  @IsEnum(MeioPagamento, {
    message: 'O meio de pagamento deve ser DIN, DEB, CRE ou PIX.',
  })
  meioPagamento?: MeioPagamento;
}
