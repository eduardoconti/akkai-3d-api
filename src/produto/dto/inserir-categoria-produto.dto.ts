import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class InserirCategoriaProdutoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nome!: string;

  @IsOptional()
  @IsInt({ message: 'idAscendente deve ser um número inteiro' })
  @Min(1)
  idAscendente?: number;
}
