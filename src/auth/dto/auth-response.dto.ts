import { UsuarioAutenticadoDto } from './usuario-autenticado.dto';

export class AuthResponseDto extends UsuarioAutenticadoDto {
  accessToken!: string;
  refreshToken!: string;
}
