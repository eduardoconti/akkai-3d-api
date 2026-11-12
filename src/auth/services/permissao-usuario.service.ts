import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import { Permission, Role, User, UserPermission } from '@auth/entities';
import {
  DefinirPermissoesUsuarioInput,
  PermissaoDisponivel,
  PermissoesUsuario,
  UsuarioAdministravel,
} from '@auth/interfaces/administracao-permissoes.interface';
import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';
import {
  calcularPermissoesEfetivas,
  RELACOES_USUARIO_COM_PERMISSOES,
} from '@auth/utils/permissoes-efetivas';

@Injectable()
export class PermissaoUsuarioService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async listarUsuarios(): Promise<UsuarioAdministravel[]> {
    const usuarios = await this.userRepository.find({
      relations: RELACOES_USUARIO_COM_PERMISSOES,
      order: { name: 'ASC' },
    });

    return usuarios.map((usuario) => ({
      id: usuario.id,
      login: usuario.login,
      name: usuario.name,
      isActive: usuario.isActive,
      idPapel: usuario.roleId,
      papel: usuario.role.name,
      quantidadePermissoes: calcularPermissoesEfetivas(usuario).length,
      quantidadeAjustes: (usuario.permissoesPersonalizadas ?? []).length,
    }));
  }

  async listarPermissoes(): Promise<PermissaoDisponivel[]> {
    const permissoes = await this.permissionRepository.find({
      order: { name: 'ASC' },
    });

    return permissoes.map((permissao) => ({
      name: permissao.name,
      description: permissao.description,
    }));
  }

  async obterPermissoes(idUsuario: number): Promise<PermissoesUsuario> {
    const usuario = await this.buscarUsuario(idUsuario);

    return this.paraPermissoesDto(usuario);
  }

  async definirPermissoes(
    idUsuario: number,
    dto: DefinirPermissoesUsuarioInput,
    ator: JwtPayload,
  ): Promise<PermissoesUsuario> {
    const usuario = await this.buscarUsuario(idUsuario);
    const papel = await this.roleRepository.findOne({
      where: { id: dto.idPapel },
      relations: { rolePermissions: { permission: true } },
    });

    if (!papel) {
      throw new NotFoundException(
        `Papel com ID ${dto.idPapel} não encontrado.`,
      );
    }

    if (
      papel.id !== usuario.roleId &&
      !ator.permissions.includes(PERMISSOES.USUARIO.ALTERAR_PAPEL)
    ) {
      throw new ForbiddenException(
        'Você não possui permissão para alterar o papel do usuário.',
      );
    }

    const desejadas = new Set(dto.permissoes);
    const catalogo = await this.permissionRepository.find();
    const idsPorNome = new Map(
      catalogo.map((permissao) => [permissao.name, permissao.id]),
    );
    const desconhecidas = [...desejadas].filter(
      (nome) => !idsPorNome.has(nome),
    );

    if (desconhecidas.length > 0) {
      throw new BadRequestException(
        `Permissões inexistentes: ${desconhecidas.join(', ')}.`,
      );
    }

    this.garantirQueAtorPodeConceder(usuario, desejadas, ator);

    if (
      ator.sub === usuario.id &&
      !desejadas.has(PERMISSOES.USUARIO.ADMINISTRAR_PERMISSOES)
    ) {
      throw new BadRequestException(
        'Você não pode remover de si mesmo a permissão de administrar permissões.',
      );
    }

    const doPapel = new Set(
      papel.rolePermissions.map(
        (rolePermission) => rolePermission.permission.name,
      ),
    );
    const ajustes: Array<{ nome: string; granted: boolean }> = [
      ...[...desejadas]
        .filter((nome) => !doPapel.has(nome))
        .map((nome) => ({ nome, granted: true })),
      ...[...doPapel]
        .filter((nome) => !desejadas.has(nome))
        .map((nome) => ({ nome, granted: false })),
    ];

    await this.userRepository.manager.transaction(async (manager) => {
      await manager.update(User, { id: usuario.id }, { roleId: papel.id });
      await manager.delete(UserPermission, { userId: usuario.id });

      if (ajustes.length > 0) {
        await manager.insert(
          UserPermission,
          ajustes.map((ajuste) => ({
            userId: usuario.id,
            permissionId: idsPorNome.get(ajuste.nome) as number,
            granted: ajuste.granted,
          })),
        );
      }
    });

    return this.obterPermissoes(usuario.id);
  }

  /** Quem administra só pode conceder o que ele próprio possui. */
  private garantirQueAtorPodeConceder(
    usuario: User,
    desejadas: Set<string>,
    ator: JwtPayload,
  ): void {
    const atuais = new Set(calcularPermissoesEfetivas(usuario));
    const naoPermitidas = [...desejadas].filter(
      (nome) => !atuais.has(nome) && !ator.permissions.includes(nome),
    );

    if (naoPermitidas.length > 0) {
      throw new ForbiddenException(
        `Você não pode conceder permissões que não possui: ${naoPermitidas.join(', ')}.`,
      );
    }
  }

  private async buscarUsuario(idUsuario: number): Promise<User> {
    const usuario = await this.userRepository.findOne({
      where: { id: idUsuario },
      relations: RELACOES_USUARIO_COM_PERMISSOES,
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuário com ID ${idUsuario} não encontrado.`,
      );
    }

    return usuario;
  }

  private paraPermissoesDto(usuario: User): PermissoesUsuario {
    const ajustes = usuario.permissoesPersonalizadas ?? [];

    return {
      id: usuario.id,
      login: usuario.login,
      name: usuario.name,
      isActive: usuario.isActive,
      idPapel: usuario.roleId,
      papel: usuario.role.name,
      permissoesEfetivas: calcularPermissoesEfetivas(usuario),
      concedidas: ajustes
        .filter((ajuste) => ajuste.granted)
        .map((ajuste) => ajuste.permission.name),
      revogadas: ajustes
        .filter((ajuste) => !ajuste.granted)
        .map((ajuste) => ajuste.permission.name),
    };
  }
}
