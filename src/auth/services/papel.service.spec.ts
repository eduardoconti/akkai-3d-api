import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import {
  Permission,
  Role,
  RolePermission,
  User,
  UserPermission,
} from '@auth/entities';
import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';
import { PapelService } from '@auth/services';

const ADMINISTRAR_USUARIOS = PERMISSOES.USUARIO.ADMINISTRAR_PERMISSOES;
const ADMINISTRAR_PAPEL = PERMISSOES.PAPEL.ADMINISTRAR;

function papel(
  id: number,
  nome: string,
  permissoes: string[],
  descricao?: string,
): Role {
  return {
    id,
    name: nome,
    description: descricao,
    rolePermissions: permissoes.map((name) => ({ permission: { name } })),
  } as unknown as Role;
}

const catalogo = [
  'venda.ler',
  'venda.excluir',
  'produto.ler',
  ADMINISTRAR_USUARIOS,
  ADMINISTRAR_PAPEL,
].map((name, index) => ({ id: index + 1, name }) as Permission);

describe('PapelService', () => {
  let service: PapelService;
  let roleRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    manager: { transaction: jest.Mock };
  };
  let permissionRepository: { find: jest.Mock };
  let userRepository: { count: jest.Mock };
  let manager: {
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    find: jest.Mock;
  };
  const ator: JwtPayload = {
    sub: 1,
    login: 'eduardo',
    role: 'admin',
    permissions: [
      ADMINISTRAR_USUARIOS,
      ADMINISTRAR_PAPEL,
      'venda.ler',
      'venda.excluir',
      'produto.ler',
    ],
  };

  beforeEach(() => {
    manager = {
      insert: jest.fn().mockResolvedValue({ identifiers: [{ id: 10 }] }),
      update: jest.fn(),
      delete: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
    };
    roleRepository = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      manager: {
        transaction: jest.fn((acao: (m: typeof manager) => Promise<unknown>) =>
          acao(manager),
        ),
      },
    };
    permissionRepository = { find: jest.fn().mockResolvedValue(catalogo) };
    userRepository = { count: jest.fn().mockResolvedValue(0) };

    service = new PapelService(
      roleRepository as unknown as Repository<Role>,
      permissionRepository as unknown as Repository<Permission>,
      userRepository as unknown as Repository<User>,
    );
  });

  describe('listar', () => {
    it('deve listar papéis com permissões, usuários e proteção', async () => {
      roleRepository.find.mockResolvedValue([
        papel(1, 'user', ['venda.ler'], 'Padrão'),
        papel(3, 'vendedor', ['venda.ler']),
      ]);
      userRepository.count.mockResolvedValueOnce(4).mockResolvedValueOnce(0);

      expect(await service.listar()).toEqual([
        {
          id: 1,
          name: 'user',
          description: 'Padrão',
          permissoes: ['venda.ler'],
          quantidadeUsuarios: 4,
          protegido: true,
        },
        {
          id: 3,
          name: 'vendedor',
          description: undefined,
          permissoes: ['venda.ler'],
          quantidadeUsuarios: 0,
          protegido: false,
        },
      ]);
    });
  });

  describe('criar', () => {
    beforeEach(() => {
      roleRepository.findOne.mockResolvedValue(
        papel(10, 'vendedor', ['venda.ler'], 'Atende no balcão'),
      );
    });

    it('deve criar o papel e gravar suas permissões', async () => {
      const resultado = await service.criar(
        {
          name: 'vendedor',
          description: 'Atende no balcão',
          permissoes: ['venda.ler', 'produto.ler'],
        },
        ator,
      );

      expect(manager.insert).toHaveBeenNthCalledWith(1, Role, {
        name: 'vendedor',
        description: 'Atende no balcão',
      });
      expect(manager.insert).toHaveBeenNthCalledWith(2, RolePermission, [
        { role: { id: 10 }, permission: { id: 1 } },
        { role: { id: 10 }, permission: { id: 3 } },
      ]);
      expect(resultado.name).toBe('vendedor');
    });

    it('deve criar um papel sem permissões', async () => {
      await service.criar({ name: 'vazio', permissoes: [] }, ator);

      expect(manager.insert).toHaveBeenCalledTimes(1);
    });

    it('deve rejeitar nome já existente sem diferenciar maiúsculas', async () => {
      roleRepository.find.mockResolvedValue([papel(3, 'Vendedor', [])]);

      await expect(
        service.criar({ name: 'vendedor', permissoes: [] }, ator),
      ).rejects.toThrow(ConflictException);
      expect(roleRepository.manager.transaction).not.toHaveBeenCalled();
    });

    it('deve rejeitar permissões inexistentes', async () => {
      await expect(
        service.criar({ name: 'x', permissoes: ['nao.existe'] }, ator),
      ).rejects.toThrow(
        new BadRequestException('Permissões inexistentes: nao.existe.'),
      );
    });

    it('não deve incluir permissões que o administrador não possui', async () => {
      const atorLimitado = { ...ator, permissions: [ADMINISTRAR_PAPEL] };

      await expect(
        service.criar({ name: 'x', permissoes: ['venda.ler'] }, atorLimitado),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('atualizar', () => {
    beforeEach(() => {
      roleRepository.findOne.mockResolvedValue(
        papel(3, 'vendedor', ['venda.ler', 'venda.excluir']),
      );
    });

    it('deve substituir as permissões e atualizar nome e descrição', async () => {
      await service.atualizar(
        3,
        {
          name: 'balconista',
          description: 'Novo',
          permissoes: ['venda.ler', 'produto.ler'],
        },
        ator,
      );

      expect(manager.update).toHaveBeenCalledWith(
        Role,
        { id: 3 },
        { name: 'balconista', description: 'Novo' },
      );
      expect(manager.delete).toHaveBeenCalledWith(RolePermission, {
        role: { id: 3 },
      });
      expect(manager.insert).toHaveBeenCalledWith(RolePermission, [
        { role: { id: 3 }, permission: { id: 1 } },
        { role: { id: 3 }, permission: { id: 3 } },
      ]);
    });

    it('deve limpar a descrição quando vazia', async () => {
      await service.atualizar(
        3,
        { name: 'vendedor', permissoes: ['venda.ler'] },
        ator,
      );

      const [, , alteracoes] = manager.update.mock.calls[0] as [
        unknown,
        unknown,
        { description: () => string },
      ];
      expect(alteracoes.description()).toBe('NULL');
    });

    it('deve descartar ajustes individuais que o papel passou a cobrir', async () => {
      manager.find
        .mockResolvedValueOnce([{ id: 7 }, { id: 8 }])
        .mockResolvedValueOnce([
          // concedida que agora o papel já tem
          { id: 100, granted: true, permission: { name: 'produto.ler' } },
          // revogada de algo que o papel já não tem
          { id: 101, granted: false, permission: { name: 'venda.excluir' } },
          // concedida que continua fazendo sentido
          { id: 102, granted: true, permission: { name: 'caixa.ler' } },
        ]);

      await service.atualizar(
        3,
        { name: 'vendedor', permissoes: ['venda.ler', 'produto.ler'] },
        ator,
      );

      expect(manager.delete).toHaveBeenCalledWith(UserPermission, [100, 101]);
    });

    it('deve lançar NotFoundException quando o papel não existe', async () => {
      roleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.atualizar(99, { name: 'x', permissoes: [] }, ator),
      ).rejects.toThrow(NotFoundException);
    });

    it('não deve renomear papéis do sistema', async () => {
      roleRepository.findOne.mockResolvedValue(papel(1, 'user', ['venda.ler']));

      await expect(
        service.atualizar(
          1,
          { name: 'outro', permissoes: ['venda.ler'] },
          ator,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve permitir alterar as permissões de um papel do sistema', async () => {
      roleRepository.findOne.mockResolvedValue(papel(1, 'user', ['venda.ler']));

      await service.atualizar(
        1,
        { name: 'user', permissoes: ['venda.ler', 'produto.ler'] },
        ator,
      );

      expect(roleRepository.manager.transaction).toHaveBeenCalled();
    });

    it('deve rejeitar nome usado por outro papel', async () => {
      roleRepository.find.mockResolvedValue([
        papel(3, 'vendedor', []),
        papel(4, 'caixa', []),
      ]);

      await expect(
        service.atualizar(3, { name: 'caixa', permissoes: [] }, ator),
      ).rejects.toThrow(ConflictException);
    });

    it('não deve acrescentar permissões que o administrador não possui', async () => {
      const atorLimitado = {
        ...ator,
        permissions: [ADMINISTRAR_PAPEL, 'venda.ler'],
      };

      await expect(
        service.atualizar(
          3,
          { name: 'vendedor', permissoes: ['venda.ler', 'produto.ler'] },
          atorLimitado,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve manter permissões atuais mesmo que o administrador não as possua', async () => {
      const atorLimitado = {
        ...ator,
        permissions: [ADMINISTRAR_PAPEL, 'venda.ler'],
      };

      await service.atualizar(
        3,
        { name: 'vendedor', permissoes: ['venda.ler', 'venda.excluir'] },
        atorLimitado,
      );

      expect(roleRepository.manager.transaction).toHaveBeenCalled();
    });

    it('não deve deixar o administrador remover a administração do próprio papel', async () => {
      roleRepository.findOne.mockResolvedValue(
        papel(2, 'admin', [
          'venda.ler',
          ADMINISTRAR_USUARIOS,
          ADMINISTRAR_PAPEL,
        ]),
      );

      await expect(
        service.atualizar(
          2,
          { name: 'admin', permissoes: ['venda.ler', ADMINISTRAR_PAPEL] },
          ator,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(roleRepository.manager.transaction).not.toHaveBeenCalled();
    });

    it('deve permitir retirar a administração de outro papel', async () => {
      roleRepository.findOne.mockResolvedValue(
        papel(3, 'gerente', ['venda.ler', ADMINISTRAR_USUARIOS]),
      );

      await service.atualizar(
        3,
        { name: 'gerente', permissoes: ['venda.ler'] },
        ator,
      );

      expect(roleRepository.manager.transaction).toHaveBeenCalled();
    });
  });

  describe('excluir', () => {
    it('deve excluir o papel e suas permissões', async () => {
      roleRepository.findOne.mockResolvedValue(papel(3, 'vendedor', []));

      await service.excluir(3);

      expect(manager.delete).toHaveBeenNthCalledWith(1, RolePermission, {
        role: { id: 3 },
      });
      expect(manager.delete).toHaveBeenNthCalledWith(2, Role, { id: 3 });
    });

    it('não deve excluir papéis do sistema', async () => {
      roleRepository.findOne.mockResolvedValue(papel(2, 'admin', []));

      await expect(service.excluir(2)).rejects.toThrow(BadRequestException);
    });

    it('não deve excluir papel que ainda tem usuários', async () => {
      roleRepository.findOne.mockResolvedValue(papel(3, 'vendedor', []));
      userRepository.count.mockResolvedValue(2);

      await expect(service.excluir(3)).rejects.toThrow(
        new ConflictException(
          'O papel "vendedor" não pode ser excluído porque 2 usuário(s) ainda o utilizam.',
        ),
      );
      expect(manager.delete).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando o papel não existe', async () => {
      roleRepository.findOne.mockResolvedValue(null);

      await expect(service.excluir(99)).rejects.toThrow(NotFoundException);
    });
  });
});
