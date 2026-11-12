export interface DefinirPermissoesUsuarioInput {
  idPapel: number;
  /** Conjunto final de permissões do usuário (papel + ajustes individuais). */
  permissoes: string[];
}

export interface UsuarioAdministravel {
  id: number;
  login: string;
  name: string;
  isActive: boolean;
  idPapel: number;
  papel: string;
  quantidadePermissoes: number;
  /** Permissões concedidas ou revogadas além do que o papel define. */
  quantidadeAjustes: number;
}

export interface PermissaoDisponivel {
  name: string;
  description?: string;
}

export interface PapelComPermissoes {
  id: number;
  name: string;
  description?: string;
  permissoes: string[];
  quantidadeUsuarios: number;
  /** Papéis do sistema não podem ser renomeados nem excluídos. */
  protegido: boolean;
}

export interface SalvarPapelInput {
  name: string;
  description?: string;
  /** Conjunto final de permissões do papel. */
  permissoes: string[];
}

export interface PermissoesUsuario {
  id: number;
  login: string;
  name: string;
  isActive: boolean;
  idPapel: number;
  papel: string;
  permissoesEfetivas: string[];
  concedidas: string[];
  revogadas: string[];
}
