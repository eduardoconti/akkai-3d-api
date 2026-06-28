import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';
import { TransformarLista } from '@common/decorators/transformar-lista.decorator';
import {
  CanalAtendimentoOrcamento,
  StatusOrcamento,
  TipoOrcamento,
} from '@orcamento/enums';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PesquisarOrcamentosDto extends PesquisaPaginadaDto {
  @ApiPropertyOptional({ enum: StatusOrcamento, isArray: true })
  @IsOptional()
  @TransformarLista<StatusOrcamento>()
  @IsArray({
    message: 'Os status devem ser informados em formato de lista.',
  })
  @IsEnum(StatusOrcamento, {
    each: true,
    message: 'Cada status informado deve ser um status de orçamento válido.',
  })
  status?: StatusOrcamento[];

  @ApiPropertyOptional({ enum: TipoOrcamento })
  @IsOptional()
  @IsEnum(TipoOrcamento, {
    message: 'O tipo informado deve ser um tipo de orçamento válido.',
  })
  tipo?: TipoOrcamento;

  @ApiPropertyOptional({ enum: CanalAtendimentoOrcamento })
  @IsOptional()
  @IsEnum(CanalAtendimentoOrcamento, {
    message: 'O canal de atendimento informado deve ser válido.',
  })
  canalAtendimento?: CanalAtendimentoOrcamento;
}
