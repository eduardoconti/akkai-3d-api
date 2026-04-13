import { IsString, MinLength } from 'class-validator';

export class AlterarSenhaDto {
  @IsString({ message: 'A senha atual deve ser um texto.' })
  @MinLength(6, {
    message: 'A senha atual deve ter pelo menos 6 caracteres.',
  })
  currentPassword!: string;

  @IsString({ message: 'A nova senha deve ser um texto.' })
  @MinLength(6, {
    message: 'A nova senha deve ter pelo menos 6 caracteres.',
  })
  newPassword!: string;
}
