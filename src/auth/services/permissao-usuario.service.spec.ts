import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import { Permission, Role, User, UserPermission } from '@auth/entities';
import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';
import { PermissaoUsuarioService } from '@auth/services';

const ADMINISTRAR = PERMISSOES.USUARIO.ADMINISTRAR_PERMISSOES;
const ALTERAR_PAPEL = PERMISSOES.USUARIO.ALTERAR_PAPEL;

function papel(id: number, nome: string, permissoes: string[]): Role {
  return {
    id,
    name: nome,
    description: `Papel ${nome}`,
    rolePermissions: permissoes.map((name) => ({ permission: { name } })),
  } as unknown as Role;
}

function usuario(
  overrides: Partial<User> & {
    doPapel?: string[];
    ajustes?: Array<{ nome: string; granted: boolean }>;
  } = {},
): User {
  const { doPapel = ['venda.ler'], ajustes = [], ...resto } = overrides;

  return {
    id: 2,
    login: 'tinho',
    name: 'Tinho',
    isActive: true,
    roleId: 1,
    role: papel(1, 'user', doPapel),
    permissoesPersonalizadas: ajustes.map(
      ({ nome, granted }) =>
        ({ granted, permission: { name: nome } }) as unknown as UserPermission,
    ),
    ...resto,
  } as unknown as User;
}

const catalogo = [
  'venda.ler',
  'venda.excluir',
  'produto.excluir',
  ADMINISTRAR,
  ALTERAR_PAPEL,
].map((name, index) => ({ id: index + 1, name }) as Permission);

describe('PermissaoUsuarioService', () => {
  let service: PermissaoUsuarioService;
  let userRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    manager: { transaction: jest.Mock };
  };
  let roleRepository: { find: jest.Mock; findOne: jest.Mock };
  let permissionRepository: { find: jest.Mock };
  let manager: { update: jest.Mock; delete: jest.Mock; insert: jest.Mock };
  const ator: JwtPayload = {
    sub: 1,
    login: 'eduardo',
    role: 'admin',
    permissions: [
      ADMINISTRAR,
      ALTERAR_PAPEL,
      'venda.ler',
      'venda.excluir',
      'produto.excluir',
    ],
  };

  beforeEach(() => {
    manager = {
      update: jest.fn(),
      delete: jest.fn(),
      insert: jest.fn(),
    };
    userRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      manager: {
        transaction: jest.fn((acao: (m: typeof manager) => Promise<void>) =>
          acao(manager),
        ),
      },
    };
    roleRepository = { find: jest.fn(), findOne: jest.fn() };
    permissionRepository = { find: jest.fn().mockResolvedValue(catalogo) };

    service = new PermissaoUsuarioService(
      userRepository as unknown as Repository<User>,
      roleRepository as unknown as Repository<Role>,
      permissionRepository as unknown as Repository<Permission>,
    );
  });

  describe('listarUsuarios', () => {
    it('deve resumir permissões efetivas e ajustes de cada usuário', async () => {
      userRepository.find.mockResolvedValue([
        usuario({
          doPapel: ['venda.ler', 'venda.excluir'],
          ajustes: [{ nome: 'venda.excluir', granted: false }],
        }),
      ]);

      const resultado = await service.listarUsuarios();

      expect(resultado).toEqual([
        {
          id: 2,
          login: 'tinho',
          name: 'Tinho',
          isActive: true,
          idPapel: 1,
          papel: 'user',
          quantidadePermissoes: 1,
          quantidadeAjustes: 1,
        },
      ]);
    });
  });

  describe('listarPermissoes', () => {
    it('deve listar o catálogo de permissões', async () => {
      permissionRepository.find.mockResolvedValue([
        { id: 1, name: 'venda.ler', description: 'Consultar vendas' },
      ]);

      expect(await service.listarPermissoes()).toEqual([
        { name: 'venda.ler', description: 'Consultar vendas' },
      ]);
    });
  });

  describe('obterPermissoes', () => {
    it('deve separar permissões concedidas e revogadas', async () => {
      userRepository.findOne.mockResolvedValue(
        usuario({
          doPapel: ['venda.ler', 'venda.excluir'],
          ajustes: [
            { nome: 'venda.excluir', granted: false },
            { nome: 'produto.excluir', granted: true },
          ],
        }),
      );

      const resultado = await service.obterPermissoes(2);

      expect(resultado.concedidas).toEqual(['produto.excluir']);
      expect(resultado.revogadas).toEqual(['venda.excluir']);
      expect(resultado.permissoesEfetivas.sort()).toEqual([
        'produto.excluir',
        'venda.ler',
      ]);
    });

    it('deve lançar NotFoundException quando o usuário não existe', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.obterPermissoes(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('definirPermissoes', () => {
    beforeEach(() => {
      userRepository.findOne
        .mockResolvedValueOnce(usuario())
        .mockResolvedValue(usuario());
      roleRepository.findOne.mockResolvedValue(
        papel(1, 'user', ['venda.ler', 'venda.excluir']),
      );
    });

    it('deve guardar apenas o que difere do papel', async () => {
      await service.definirPermissoes(
        2,
        { idPapel: 1, permissoes: ['venda.ler', 'produto.excluir'] },
        ator,
      );

      expect(manager.update).toHaveBeenCalledWith(
        User,
        { id: 2 },
        { roleId: 1 },
      );
      expect(manager.delete).toHaveBeenCalledWith(UserPermission, {
        userId: 2,
      });
      expect(manager.insert).toHaveBeenCalledWith(UserPermission, [
        { userId: 2, permissionId: 3, granted: true },
        { userId: 2, permissionId: 2, granted: false },
      ]);
    });

    it('não deve inserir ajustes quando o conjunto é igual ao do papel', async () => {
      await service.definirPermissoes(
        2,
        { idPapel: 1, permissoes: ['venda.ler', 'venda.excluir'] },
        ator,
      );

      expect(manager.delete).toHaveBeenCalled();
      expect(manager.insert).not.toHaveBeenCalled();
    });

    it('deve rejeitar permissões inexistentes', async () => {
      await expect(
        service.definirPermissoes(
          2,
          { idPapel: 1, permissoes: ['venda.ler', 'nao.existe'] },
          ator,
        ),
      ).rejects.toThrow(
        new BadRequestException('Permissões inexistentes: nao.existe.'),
      );
      expect(userRepository.manager.transaction).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando o papel não existe', async () => {
      roleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.definirPermissoes(2, { idPapel: 9, permissoes: [] }, ator),
      ).rejects.toThrow(NotFoundException);
    });

    it('não deve permitir conceder o que o administrador não possui', async () => {
      const atorLimitado = {
        ...ator,
        permissions: [ADMINISTRAR, 'venda.ler'],
      };

      await expect(
        service.definirPermissoes(
          2,
          { idPapel: 1, permissoes: ['venda.ler', 'produto.excluir'] },
          atorLimitado,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(userRepository.manager.transaction).not.toHaveBeenCalled();
    });

    it('deve exigir permissão específica para trocar o papel', async () => {
      roleRepository.findOne.mockResolvedValue(
        papel(2, 'admin', ['venda.ler']),
      );
      const atorSemTrocaDePapel = {
        ...ator,
        permissions: ator.permissions.filter((nome) => nome !== ALTERAR_PAPEL),
      };

      await expect(
        service.definirPermissoes(
          2,
          { idPapel: 2, permissoes: ['venda.ler'] },
          atorSemTrocaDePapel,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('não deve deixar o administrador remover a própria permissão de administrar', async () => {
      userRepository.findOne.mockReset();
      userRepository.findOne.mockResolvedValue(
        usuario({ id: 1, doPapel: ['venda.ler', ADMINISTRAR] }),
      );
      roleRepository.findOne.mockResolvedValue(
        papel(1, 'user', ['venda.ler', ADMINISTRAR]),
      );

      await expect(
        service.definirPermissoes(
          1,
          { idPapel: 1, permissoes: ['venda.ler'] },
          ator,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(userRepository.manager.transaction).not.toHaveBeenCalled();
    });

    it('deve permitir ao administrador editar outras permissões de si mesmo', async () => {
      userRepository.findOne.mockReset();
      userRepository.findOne.mockResolvedValue(
        usuario({ id: 1, doPapel: ['venda.ler', ADMINISTRAR] }),
      );
      roleRepository.findOne.mockResolvedValue(
        papel(1, 'user', ['venda.ler', ADMINISTRAR]),
      );

      await service.definirPermissoes(
        1,
        { idPapel: 1, permissoes: ['venda.ler', ADMINISTRAR] },
        ator,
      );

      expect(userRepository.manager.transaction).toHaveBeenCalled();
    });
  });
});
