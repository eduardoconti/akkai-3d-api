import { FindOptionsRelations } from 'typeorm';
import { User } from '@auth/entities';

/** Relações necessárias para calcular as permissões efetivas de um usuário. */
export const RELACOES_USUARIO_COM_PERMISSOES = {
  role: { rolePermissions: { permission: true } },
  permissoesPersonalizadas: { permission: true },
} satisfies FindOptionsRelations<User>;

/**
 * Permissões que o usuário de fato possui: as do papel, mais as concedidas
 * individualmente, menos as revogadas individualmente.
 */
export function calcularPermissoesEfetivas(
  usuario: Pick<User, 'role' | 'permissoesPersonalizadas'>,
): string[] {
  const permissoes = new Set(
    (usuario.role?.rolePermissions ?? []).map(
      (rolePermission) => rolePermission.permission.name,
    ),
  );

  for (const ajuste of usuario.permissoesPersonalizadas ?? []) {
    if (ajuste.granted) {
      permissoes.add(ajuste.permission.name);
    } else {
      permissoes.delete(ajuste.permission.name);
    }
  }

  return [...permissoes];
}
