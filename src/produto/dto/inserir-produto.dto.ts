/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsInt, Min, MinLength, IsNotEmpty } from 'class-validator';

export class InserirProdutoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'O código do produto é obrigatório' })
  codigo: string;

  @IsString()
  descricao?: string;

  @IsInt({ message: 'idCategoria deve ser um número inteiro' })
  idCategoria: number;

  @IsInt({ message: 'O valor deve ser um número inteiro' })
  @Min(50, { message: 'O valor deve ser maior que R$ 0,50' })
  valor: number;
}
