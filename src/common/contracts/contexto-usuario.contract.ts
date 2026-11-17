export abstract class ContextoUsuario {
  abstract get usuarioId(): number;
  /** Permissões efetivas do usuário autenticado (as do token de acesso). */
  abstract get permissoes(): string[];
}
