import { IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString({
    message: 'O nome deve ser um texto.',
  })
  @MinLength(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  })
  name!: string;

  @IsString({
    message: 'O login deve ser um texto.',
  })
  @MinLength(3, {
    message: 'O login deve ter pelo menos 3 caracteres.',
  })
  @Matches(/^[A-Za-z]+$/, {
    message: 'O login deve conter apenas letras.',
  })
  login!: string;

  @IsString({
    message: 'A senha deve ser um texto.',
  })
  @MinLength(6, {
    message: 'A senha deve ter pelo menos 6 caracteres.',
  })
  password!: string;
}
