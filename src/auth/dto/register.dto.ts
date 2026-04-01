import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString({
    message: 'O nome deve ser um texto.',
  })
  @MinLength(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  })
  name!: string;

  @IsEmail(
    {},
    {
      message: 'O e-mail informado é inválido.',
    },
  )
  email!: string;

  @IsString({
    message: 'A senha deve ser um texto.',
  })
  @MinLength(6, {
    message: 'A senha deve ter pelo menos 6 caracteres.',
  })
  password!: string;
}
