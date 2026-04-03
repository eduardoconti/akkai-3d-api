import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class AlterarCarteiraDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString({ message: 'O nome da carteira deve ser um texto.' })
  @Length(2, 120, {
    message: 'O nome da carteira deve ter entre 2 e 120 caracteres.',
  })
  nome!: string;

  @IsOptional()
  @IsBoolean({ message: 'O status da carteira deve ser verdadeiro ou falso.' })
  ativa?: boolean;
}
