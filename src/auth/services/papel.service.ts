import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { PAPEIS_PROTEGIDOS } from '@auth/constants/papeis.constants';
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import {
  Permission,
  Role,
  RolePermission,
  User,
  UserPermission,
} from '@auth/entities';
import {
  PapelComPermissoes,
  SalvarPapelInput,
} from '@auth/interfaces/administracao-permissoes.interface';
import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';

/** Permissões que o administrador não pode retirar do próprio papel. */
const PERMISSOES_DE_ADMINISTRACAO: readonly string[] = [
  PERMISSOES.USUARIO.ADMINISTRAR_PERMISSOES,
  PERMISSOES.PAPEL.ADMINISTRAR,
];

@Injectable()
export class PapelService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async listar(): Promise<PapelComPermissoes[]> {
    const papeis = await this.roleRepository.find({
      relations: { rolePermissions: { permission: true } },
      order: { name: 'ASC' },
    });

    return Promise.all(papeis.map((papel) => this.paraDto(papel)));
  }

  async criar(
    input: SalvarPapelInput,
    ator: JwtPayload,
  ): Promise<PapelComPermissoes> {
    await this.garantirNomeDisponivel(input.name);
    const idsPorNome = await this.resolverPermissoes(input.permissoes);
    this.garantirQueAtorPodeConceder(input.permissoes, [], ator);

    const idPapel = await this.roleRepository.manager.transaction(
      async (manager) => {
        const { identifiers } = await manager.insert(Role, {
          name: input.name,
          description: input.description || undefined,
        });
        const id = (identifiers[0] as { id: number }).id;

        await this.gravarPermissoes(manager, id, input.permissoes, idsPorNome);

        return id;
      },
    );

    return this.obter(idPapel);
  }

  async atualizar(
    id: number,
    input: SalvarPapelInput,
    ator: JwtPayload,
  ): Promise<PapelComPermissoes> {
    const papel = await this.buscar(id);
    const atuais = papel.rolePermissions.map(
      (rolePermission) => rolePermission.permission.name,
    );

    if (PAPEIS_PROTEGIDOS.includes(papel.name) && input.name !== papel.name) {
      throw new BadRequestException(
        `O nome do papel "${papel.name}" não pode ser alterado.`,
      );
    }

    if (input.name !== papel.name) {
      await this.garantirNomeDisponivel(input.name, papel.id);
    }

    const idsPorNome = await this.resolverPermissoes(input.permissoes);
    this.garantirQueAtorPodeConceder(input.permissoes, atuais, ator);
    this.garantirQueAtorMantemAdministracao(papel, input.permissoes, ator);

    await this.roleRepository.manager.transaction(async (manager) => {
      await manager.update(
        Role,
        { id: papel.id },
        {
          name: input.name,
          // Descrição vazia limpa a coluna.
          description: input.description || (() => 'NULL'),
        },
      );
      await manager.delete(RolePermission, { role: { id: papel.id } });
      await this.gravarPermissoes(
        manager,
        papel.id,
        input.permissoes,
        idsPorNome,
      );
      await this.removerAjustesRedundantes(
        manager,
        papel.id,
        new Set(input.permissoes),
      );
    });

    return this.obter(papel.id);
  }

  async excluir(id: number): Promise<void> {
    const papel = await this.buscar(id);

    if (PAPEIS_PROTEGIDOS.includes(papel.name)) {
      throw new BadRequestException(
        `O papel "${papel.name}" é do sistema e não pode ser excluído.`,
      );
    }

    const quantidadeUsuarios = await this.userRepository.count({
      where: { roleId: papel.id },
    });

    if (quantidadeUsuarios > 0) {
      throw new ConflictException(
        `O papel "${papel.name}" não pode ser excluído porque ${quantidadeUsuarios} usuário(s) ainda o utilizam.`,
      );
    }

    await this.roleRepository.manager.transaction(async (manager) => {
      await manager.delete(RolePermission, { role: { id: papel.id } });
      await manager.delete(Role, { id: papel.id });
    });
  }

  private async obter(id: number): Promise<PapelComPermissoes> {
    return this.paraDto(await this.buscar(id));
  }

  private async buscar(id: number): Promise<Role> {
    const papel = await this.roleRepository.findOne({
      where: { id },
      relations: { rolePermissions: { permission: true } },
    });

    if (!papel) {
      throw new NotFoundException(`Papel com ID ${id} não encontrado.`);
    }

    return papel;
  }

  private async garantirNomeDisponivel(
    nome: string,
    ignorarId?: number,
  ): Promise<void> {
    const existentes = await this.roleRepository.find();
    const duplicado = existentes.some(
      (papel) =>
        papel.id !== ignorarId &&
        papel.name.toLowerCase() === nome.toLowerCase(),
    );

    if (duplicado) {
      throw new ConflictException(`Já existe um papel chamado "${nome}".`);
    }
  }

  /** Valida os nomes recebidos contra o catálogo e devolve nome → id. */
  private async resolverPermissoes(
    nomes: string[],
  ): Promise<Map<string, number>> {
    const catalogo = await this.permissionRepository.find();
    const idsPorNome = new Map(
      catalogo.map((permissao) => [permissao.name, permissao.id]),
    );
    const desconhecidas = nomes.filter((nome) => !idsPorNome.has(nome));

    if (desconhecidas.length > 0) {
      throw new BadRequestException(
        `Permissões inexistentes: ${desconhecidas.join(', ')}.`,
      );
    }

    return idsPorNome;
  }

  /** Quem administra só pode acrescentar ao papel o que ele próprio possui. */
  private garantirQueAtorPodeConceder(
    desejadas: string[],
    atuais: string[],
    ator: JwtPayload,
  ): void {
    const naoPermitidas = desejadas.filter(
      (nome) => !atuais.includes(nome) && !ator.permissions.includes(nome),
    );

    if (naoPermitidas.length > 0) {
      throw new ForbiddenException(
        `Você não pode conceder permissões que não possui: ${naoPermitidas.join(', ')}.`,
      );
    }
  }

  /** Evita que o administrador se tranque fora retirando a administração do próprio papel. */
  private garantirQueAtorMantemAdministracao(
    papel: Role,
    desejadas: string[],
    ator: JwtPayload,
  ): void {
    if (papel.name !== ator.role) {
      return;
    }

    const removidas = PERMISSOES_DE_ADMINISTRACAO.filter(
      (nome) => ator.permissions.includes(nome) && !desejadas.includes(nome),
    );

    if (removidas.length > 0) {
      throw new BadRequestException(
        `Você não pode remover do seu próprio papel as permissões: ${removidas.join(', ')}.`,
      );
    }
  }

  private async gravarPermissoes(
    manager: EntityManager,
    idPapel: number,
    nomes: string[],
    idsPorNome: Map<string, number>,
  ): Promise<void> {
    if (nomes.length === 0) {
      return;
    }

    await manager.insert(
      RolePermission,
      nomes.map((nome) => ({
        role: { id: idPapel },
        permission: { id: idsPorNome.get(nome) as number },
      })),
    );
  }

  /**
   * Ajustes individuais guardam só a diferença em relação ao papel. Se o papel
   * passou a conter (ou deixou de conter) a permissão, o ajuste não faz mais
   * sentido e é descartado.
   */
  private async removerAjustesRedundantes(
    manager: EntityManager,
    idPapel: number,
    permissoesDoPapel: Set<string>,
  ): Promise<void> {
    const usuarios = await manager.find(User, {
      where: { roleId: idPapel },
      select: { id: true },
    });

    if (usuarios.length === 0) {
      return;
    }

    const ajustes = await manager.find(UserPermission, {
      where: { userId: In(usuarios.map((usuario) => usuario.id)) },
      relations: { permission: true },
    });
    const redundantes = ajustes.filter((ajuste) =>
      ajuste.granted
        ? permissoesDoPapel.has(ajuste.permission.name)
        : !permissoesDoPapel.has(ajuste.permission.name),
    );

    if (redundantes.length > 0) {
      await manager.delete(
        UserPermission,
        redundantes.map((ajuste) => ajuste.id),
      );
    }
  }

  private async paraDto(papel: Role): Promise<PapelComPermissoes> {
    return {
      id: papel.id,
      name: papel.name,
      description: papel.description ?? undefined,
      permissoes: papel.rolePermissions.map(
        (rolePermission) => rolePermission.permission.name,
      ),
      quantidadeUsuarios: await this.userRepository.count({
        where: { roleId: papel.id },
      }),
      protegido: PAPEIS_PROTEGIDOS.includes(papel.name),
    };
  }
}
