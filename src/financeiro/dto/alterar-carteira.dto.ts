import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class AlterarCarteiraDto {
  @IsString({ message: 'O nome da carteira deve ser um texto.' })
  @Length(2, 120, {
    message: 'O nome da carteira deve ter entre 2 e 120 caracteres.',
  })
  nome!: string;

  @IsOptional()
  @IsBoolean({ message: 'O status da carteira deve ser verdadeiro ou falso.' })
  ativa?: boolean;
}
