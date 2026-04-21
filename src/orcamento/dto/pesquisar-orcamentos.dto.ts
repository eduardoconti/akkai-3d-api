import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';
import { StatusOrcamento } from '@orcamento/entities';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional } from 'class-validator';

function normalizeStatus(value: unknown): StatusOrcamento[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean) as StatusOrcamento[];
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean) as StatusOrcamento[];
  }

  return undefined;
}

export class PesquisarOrcamentosDto extends PesquisaPaginadaDto {
  @IsOptional()
  @Transform(({ value }) => normalizeStatus(value))
  @IsArray({
    message: 'Os status devem ser informados em formato de lista.',
  })
  @IsEnum(StatusOrcamento, {
    each: true,
    message: 'Cada status informado deve ser um status de orçamento válido.',
  })
  status?: StatusOrcamento[];
}
