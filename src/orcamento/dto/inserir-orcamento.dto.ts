import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { trimStringValue } from '@common/transforms/trim-string.transform';
import {
  CanalAtendimentoOrcamento,
  StatusOrcamento,
  TipoOrcamento,
} from '@orcamento/entities';

export class InserirOrcamentoDto {
  @Transform(trimStringValue)
  @IsString({ message: 'O nome do cliente deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do cliente é obrigatório.' })
  @MinLength(2, {
    message: 'O nome do cliente deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(120, {
    message: 'O nome do cliente deve ter no máximo 120 caracteres.',
  })
  nomeCliente!: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'O telefone do cliente deve ser um texto.' })
  @MinLength(8, {
    message: 'O telefone do cliente deve ter pelo menos 8 caracteres.',
  })
  @MaxLength(30, {
    message: 'O telefone do cliente deve ter no máximo 30 caracteres.',
  })
  telefoneCliente?: string;

  @IsEnum(TipoOrcamento, { message: 'O tipo do orçamento é inválido.' })
  tipo!: TipoOrcamento;

  @ValidateIf((o: InserirOrcamentoDto) => o.tipo === TipoOrcamento.ONLINE)
  @IsEnum(CanalAtendimentoOrcamento, {
    message: 'O canal de atendimento deve ser WPP ou INSTAGRAM.',
  })
  canalAtendimento?: CanalAtendimentoOrcamento;

  @ValidateIf((o: InserirOrcamentoDto) => o.tipo === TipoOrcamento.FEIRA)
  @IsInt({ message: 'A feira deve ser um número inteiro.' })
  @IsPositive({ message: 'Selecione uma feira válida.' })
  idFeira?: number;

  @IsOptional()
  @IsEnum(StatusOrcamento, { message: 'O status do orçamento é inválido.' })
  status?: StatusOrcamento;

  @IsOptional()
  @IsInt({ message: 'O valor deve ser um número inteiro (em centavos).' })
  @IsPositive({ message: 'O valor deve ser maior que zero.' })
  valor?: number;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'A descrição deve ser um texto.' })
  @MaxLength(1000, {
    message: 'A descrição deve ter no máximo 1000 caracteres.',
  })
  descricao?: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsUrl(
    { require_protocol: true },
    { message: 'O link STL deve ser uma URL válida.' },
  )
  @MaxLength(500, {
    message: 'O link STL deve ter no máximo 500 caracteres.',
  })
  linkSTL?: string;
}
