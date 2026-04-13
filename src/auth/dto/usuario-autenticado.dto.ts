export class UsuarioAutenticadoDto {
  id!: number;
  name!: string;
  login!: string;
  isActive!: boolean;
  roleId!: number;
  role!: string;
  permissions!: string[];
  createdAt!: Date;
  updatedAt!: Date;
}
