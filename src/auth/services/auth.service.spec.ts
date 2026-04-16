import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from '@auth/services';
import { RefreshSession, Role, User } from '@auth/entities';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: {
    exists: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let roleRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let refreshSessionRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let jwtService: {
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
  };
  let configService: {
    getOrThrow: jest.Mock;
    get: jest.Mock;
  };

  beforeEach(async () => {
    userRepository = {
      exists: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    roleRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    refreshSessionRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
    configService = {
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string | number> = {
          AUTH_BCRYPT_ROUNDS: 10,
          JWT_ACCESS_SECRET: 'access-secret',
          JWT_REFRESH_SECRET: 'refresh-secret',
          AUTH_ACCESS_TOKEN_TTL_MINUTES: 15,
          AUTH_REFRESH_TOKEN_TTL_DAYS: 7,
        };

        return values[key];
      }),
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Role), useValue: roleRepository },
        {
          provide: getRepositoryToken(RefreshSession),
          useValue: refreshSessionRepository,
        },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve lançar conflito ao registrar login já existente', async () => {
    userRepository.exists.mockResolvedValue(true);

    await expect(
      service.register({
        name: 'Eduardo',
        login: 'eduardo',
        password: '123456',
      }),
    ).rejects.toThrow(
      new ConflictException('Já existe um usuário com esse login.'),
    );
  });

  it('deve registrar usuário e emitir sessão', async () => {
    const role = { id: 1, name: 'user', description: 'Padrão' } as Role;
    const user = {
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      passwordHash: 'password-hash',
      roleId: 1,
      isActive: true,
      createdAt: new Date('2026-04-13T10:00:00.000Z'),
      updatedAt: new Date('2026-04-13T10:00:00.000Z'),
    } as User;
    const authenticatedUser = {
      ...user,
      role: { id: 1, name: 'user', rolePermissions: [] },
    } as unknown as User;
    const savedSession = {
      id: 'session-id',
      userId: 1,
      tokenHash: '',
      expiresAt: new Date(),
    } as RefreshSession;

    userRepository.exists.mockResolvedValue(false);
    roleRepository.findOne.mockResolvedValue(role);
    userRepository.create.mockReturnValue(user);
    userRepository.save.mockResolvedValue(user);
    userRepository.findOne.mockResolvedValue(authenticatedUser);
    refreshSessionRepository.create.mockReturnValue(savedSession);
    refreshSessionRepository.save
      .mockResolvedValueOnce(savedSession)
      .mockResolvedValueOnce({ ...savedSession, tokenHash: 'refresh-hash' });
    jest
      .spyOn(bcrypt, 'hash')
      .mockResolvedValueOnce('password-hash' as never)
      .mockResolvedValueOnce('refresh-hash' as never);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await service.register({
      name: 'Eduardo',
      login: 'eduardo',
      password: '123456',
    });

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Eduardo', login: 'eduardo', roleId: 1 }),
    );
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result).toMatchObject({
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      isActive: true,
      roleId: 1,
      role: 'user',
      permissions: [],
    });
  });

  it('deve lançar erro no login com senha inválida', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      login: 'eduardo',
      passwordHash: 'hash',
      isActive: true,
      role: { name: 'user', rolePermissions: [] },
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(
      service.login({ login: 'eduardo', password: '123456' }),
    ).rejects.toThrow(new UnauthorizedException('Login ou senha inválidos.'));
  });

  it('deve lançar erro no refresh sem token', async () => {
    await expect(service.refresh(undefined)).rejects.toThrow(
      new UnauthorizedException('Refresh token ausente.'),
    );
  });

  it('deve lançar erro quando usuário autenticado não existir em me', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.me(1)).rejects.toThrow(
      new UnauthorizedException('Usuário autenticado não encontrado.'),
    );
  });

  it('deve lançar erro no login com usuário não encontrado', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      service.login({ login: 'naoexiste', password: '123456' }),
    ).rejects.toThrow(new UnauthorizedException('Login ou senha inválidos.'));
  });

  it('deve fazer login com sucesso e emitir sessão', async () => {
    const authenticatedUser = {
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      passwordHash: 'hash',
      isActive: true,
      roleId: 1,
      createdAt: new Date('2026-04-13T10:00:00.000Z'),
      updatedAt: new Date('2026-04-13T10:00:00.000Z'),
      role: { id: 1, name: 'user', rolePermissions: [] },
    } as unknown as User;
    const savedSession = {
      id: 'session-id',
      userId: 1,
      tokenHash: '',
      expiresAt: new Date(),
    } as RefreshSession;

    userRepository.findOne
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(authenticatedUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('refresh-hash' as never);
    refreshSessionRepository.create.mockReturnValue(savedSession);
    refreshSessionRepository.save
      .mockResolvedValueOnce(savedSession)
      .mockResolvedValueOnce({ ...savedSession, tokenHash: 'refresh-hash' });
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await service.login({
      login: 'eduardo',
      password: '123456',
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result).toMatchObject({
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      isActive: true,
      roleId: 1,
      role: 'user',
      permissions: [],
    });
  });

  it('deve lançar erro no refresh com token inválido', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

    await expect(service.refresh('token-invalido')).rejects.toThrow(
      new UnauthorizedException('Refresh token inválido ou expirado.'),
    );
  });

  it('deve lançar erro no refresh com sessão revogada', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      sessionId: 'session-id',
    });
    refreshSessionRepository.findOne.mockResolvedValue({
      id: 'session-id',
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 100000),
    });

    await expect(service.refresh('token-valido')).rejects.toThrow(
      new UnauthorizedException('Sessão inválida ou expirada.'),
    );
  });

  it('deve lançar erro no refresh com sessão expirada', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      sessionId: 'session-id',
    });
    refreshSessionRepository.findOne.mockResolvedValue({
      id: 'session-id',
      revokedAt: null,
      expiresAt: new Date(Date.now() - 1000),
    });

    await expect(service.refresh('token-valido')).rejects.toThrow(
      new UnauthorizedException('Sessão inválida ou expirada.'),
    );
  });

  it('deve lançar erro no refresh quando token não bate com o hash da sessão', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      sessionId: 'session-id',
    });
    refreshSessionRepository.findOne.mockResolvedValue({
      id: 'session-id',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 100000),
      tokenHash: 'hash-diferente',
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
    refreshSessionRepository.save.mockResolvedValue({});

    await expect(service.refresh('token-valido')).rejects.toThrow(
      new UnauthorizedException('Sessão inválida ou expirada.'),
    );
  });

  it('deve lançar erro no refresh com sessão não encontrada', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      sessionId: 'session-id',
    });
    refreshSessionRepository.findOne.mockResolvedValue(null);

    await expect(service.refresh('token-valido')).rejects.toThrow(
      new UnauthorizedException('Sessão inválida ou expirada.'),
    );
  });

  it('deve renovar sessão com sucesso no refresh', async () => {
    const authenticatedUser = {
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      isActive: true,
      roleId: 1,
      createdAt: new Date('2026-04-13T10:00:00.000Z'),
      updatedAt: new Date('2026-04-13T10:00:00.000Z'),
      role: {
        name: 'admin',
        rolePermissions: [
          { permission: { name: 'create:produto' } },
          { permission: { name: 'read:produto' } },
        ],
      },
    } as unknown as User;

    const session = {
      id: 'session-id',
      userId: 1,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 100000),
      tokenHash: 'hash-valido',
      user: authenticatedUser,
    };

    const newSession = {
      id: 'new-session-id',
      userId: 1,
      tokenHash: '',
      expiresAt: new Date(),
    };

    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      sessionId: 'session-id',
    });
    refreshSessionRepository.findOne.mockResolvedValue(session);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    refreshSessionRepository.save
      .mockResolvedValueOnce({ ...session, revokedAt: new Date() })
      .mockResolvedValueOnce(newSession)
      .mockResolvedValueOnce({ ...newSession, tokenHash: 'refresh-hash' });
    userRepository.findOne.mockResolvedValue(authenticatedUser);
    refreshSessionRepository.create.mockReturnValue(newSession);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('refresh-hash' as never);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await service.refresh('token-valido');

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result).toMatchObject({
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      isActive: true,
      roleId: 1,
      role: 'admin',
      permissions: ['create:produto', 'read:produto'],
    });
  });

  it('deve retornar dados do usuário em me', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      isActive: true,
      roleId: 1,
      createdAt: new Date('2026-04-13T10:00:00.000Z'),
      updatedAt: new Date('2026-04-13T10:00:00.000Z'),
      role: { name: 'user', rolePermissions: [] },
    });

    const result = await service.me(1);

    expect(result).toEqual({
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      isActive: true,
      roleId: 1,
      role: 'user',
      permissions: [],
      createdAt: new Date('2026-04-13T10:00:00.000Z'),
      updatedAt: new Date('2026-04-13T10:00:00.000Z'),
    });
  });

  it('deve listar os papéis disponíveis', async () => {
    roleRepository.find.mockResolvedValue([
      { id: 1, name: 'admin', description: 'Administrador' },
      { id: 2, name: 'user', description: 'Padrão' },
    ]);

    const result = await service.listRoles();

    expect(result).toEqual([
      { id: 1, name: 'admin', description: 'Administrador' },
      { id: 2, name: 'user', description: 'Padrão' },
    ]);
  });

  it('deve atualizar o cadastro do usuário', async () => {
    const user = {
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      passwordHash: 'hash',
      isActive: true,
      roleId: 1,
      createdAt: new Date('2026-04-13T10:00:00.000Z'),
      updatedAt: new Date('2026-04-13T10:05:00.000Z'),
      role: { id: 1, name: 'user', rolePermissions: [] },
    } as unknown as User;
    const role = {
      id: 2,
      name: 'admin',
      description: 'Administrador',
      rolePermissions: [],
      users: [],
    } as unknown as Role;
    const updatedUser = {
      ...user,
      name: 'Eduardo Silva',
      login: 'eduardosilva',
      roleId: 2,
      role,
      updatedAt: new Date('2026-04-13T11:00:00.000Z'),
    } as unknown as User;

    userRepository.findOne
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(updatedUser);
    roleRepository.findOne.mockResolvedValue(role);
    userRepository.save.mockResolvedValue(updatedUser);
    const issueSessionSpy = jest
      .spyOn(service as never, 'issueSession')
      .mockResolvedValue({
        user: updatedUser,
        accessToken: 'at',
        refreshToken: 'rt',
      } as never);

    const result = await service.updateProfile(
      1,
      {
        name: 'Eduardo Silva',
        login: 'EduardoSilva',
        isActive: true,
        roleId: 2,
      },
      ['auth.user.update_role', 'auth.user.update_status'],
    );

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Eduardo Silva',
        login: 'eduardosilva',
        isActive: true,
        roleId: 2,
      }),
    );
    expect(issueSessionSpy).toHaveBeenCalled();
    expect(result).toMatchObject({ login: 'eduardosilva', roleId: 2 });
  });

  it('deve retornar usuário sem tokens quando desativado no updateProfile', async () => {
    const role = {
      id: 1,
      name: 'user',
      description: 'Padrão',
      rolePermissions: [],
      users: [],
    } as unknown as Role;
    const user = {
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      passwordHash: 'hash',
      isActive: true,
      roleId: 1,
      createdAt: new Date('2026-04-13T10:00:00.000Z'),
      updatedAt: new Date('2026-04-13T10:05:00.000Z'),
      role,
    } as unknown as User;
    const updatedUser = { ...user, isActive: false } as User;

    userRepository.findOne
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(updatedUser);
    roleRepository.findOne.mockResolvedValue(role);
    userRepository.save.mockResolvedValue(updatedUser);

    const result = await service.updateProfile(
      1,
      { name: 'Eduardo', login: 'eduardo', isActive: false, roleId: 1 },
      ['auth.user.update_status'],
    );

    expect((result as { accessToken?: string }).accessToken).toBeUndefined();
    expect(result).toMatchObject({ id: 1, isActive: false });
  });

  it('deve lançar conflito ao atualizar cadastro com login já existente', async () => {
    const user = {
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      passwordHash: 'hash',
      isActive: true,
      roleId: 1,
      role: { id: 1, name: 'user', rolePermissions: [] },
    } as unknown as User;

    userRepository.findOne
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce({ id: 2, login: 'joao' });

    await expect(
      service.updateProfile(
        1,
        { name: 'Eduardo', login: 'joao', isActive: true, roleId: 1 },
        ['auth.user.update_role', 'auth.user.update_status'],
      ),
    ).rejects.toThrow(
      new ConflictException('Já existe um usuário com esse login.'),
    );
  });

  it('deve lançar erro quando o papel informado não existir', async () => {
    const user = {
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      passwordHash: 'hash',
      isActive: true,
      roleId: 1,
      role: { id: 1, name: 'user', rolePermissions: [] },
    } as unknown as User;

    userRepository.findOne
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    roleRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updateProfile(
        1,
        { name: 'Eduardo', login: 'eduardo', isActive: true, roleId: 99 },
        ['auth.user.update_role', 'auth.user.update_status'],
      ),
    ).rejects.toThrow(new NotFoundException('Papel com ID 99 não encontrado.'));
  });

  it('deve bloquear alteração de papel sem permissão', async () => {
    const user = {
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      passwordHash: 'hash',
      isActive: true,
      roleId: 1,
      role: { id: 1, name: 'user', rolePermissions: [] },
    } as unknown as User;
    const role = {
      id: 2,
      name: 'admin',
      description: 'Administrador',
      rolePermissions: [],
      users: [],
    } as unknown as Role;

    userRepository.findOne
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null);
    roleRepository.findOne.mockResolvedValue(role);

    await expect(
      service.updateProfile(
        1,
        { name: 'Eduardo', login: 'eduardo', isActive: true, roleId: 2 },
        [],
      ),
    ).rejects.toThrow(
      new ForbiddenException(
        'Você não possui permissão para alterar o papel do usuário.',
      ),
    );
  });

  it('deve lançar erro quando usuário autenticado não existir ao atualizar cadastro', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updateProfile(
        1,
        { name: 'Eduardo', login: 'eduardo', isActive: true, roleId: 1 },
        ['auth.user.update_role', 'auth.user.update_status'],
      ),
    ).rejects.toThrow(
      new UnauthorizedException('Usuário autenticado não encontrado.'),
    );
  });

  it('deve bloquear alteração de status sem permissão', async () => {
    const user = {
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      passwordHash: 'hash',
      isActive: true,
      roleId: 1,
      role: { id: 1, name: 'user', rolePermissions: [] },
    } as unknown as User;
    const role = {
      id: 1,
      name: 'user',
      description: 'Padrão',
      rolePermissions: [],
      users: [],
    } as unknown as Role;

    userRepository.findOne
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null);
    roleRepository.findOne.mockResolvedValue(role);

    await expect(
      service.updateProfile(
        1,
        { name: 'Eduardo', login: 'eduardo', isActive: false, roleId: 1 },
        [],
      ),
    ).rejects.toThrow(
      new ForbiddenException(
        'Você não possui permissão para alterar o status do usuário.',
      ),
    );
  });

  it('deve lançar erro quando não encontrar usuário atualizado após salvar cadastro', async () => {
    const role = {
      id: 1,
      name: 'user',
      description: 'Padrão',
      rolePermissions: [],
      users: [],
    } as unknown as Role;
    const user = {
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      passwordHash: 'hash',
      isActive: true,
      roleId: 1,
      role,
    } as unknown as User;

    userRepository.findOne
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    roleRepository.findOne.mockResolvedValue(role);
    userRepository.save.mockResolvedValue(user);

    await expect(
      service.updateProfile(
        1,
        { name: 'Eduardo', login: 'eduardo', isActive: true, roleId: 1 },
        ['auth.user.update_role', 'auth.user.update_status'],
      ),
    ).rejects.toThrow(
      new UnauthorizedException('Usuário autenticado não encontrado.'),
    );
  });

  it('deve atualizar a senha do usuário', async () => {
    const user = {
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      passwordHash: 'hash',
      isActive: true,
      roleId: 1,
      role: { id: 1, name: 'user', rolePermissions: [] },
    } as unknown as User;

    userRepository.findOne.mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hash' as never);

    await service.updatePassword(1, {
      currentPassword: '123456',
      newPassword: '654321',
    });

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: 'new-hash' }),
    );
  });

  it('deve lançar erro ao atualizar senha com senha atual inválida', async () => {
    const user = {
      id: 1,
      name: 'Eduardo',
      login: 'eduardo',
      passwordHash: 'hash',
      isActive: true,
      roleId: 1,
      role: { id: 1, name: 'user', rolePermissions: [] },
    } as unknown as User;

    userRepository.findOne.mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(
      service.updatePassword(1, {
        currentPassword: '123456',
        newPassword: '654321',
      }),
    ).rejects.toThrow(new UnauthorizedException('Senha atual inválida.'));
  });

  it('deve lançar erro ao atualizar senha quando usuário autenticado não existir', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updatePassword(1, {
        currentPassword: '123456',
        newPassword: '654321',
      }),
    ).rejects.toThrow(
      new UnauthorizedException('Usuário autenticado não encontrado.'),
    );
  });

  it('deve criar o role padrão quando não existir', async () => {
    const role = { id: 2, name: 'user', description: 'Padrão' } as Role;
    const user = {
      id: 2,
      name: 'Novo',
      login: 'novousr',
      passwordHash: 'hash',
      roleId: 2,
      isActive: true,
    } as User;
    const authenticatedUser = {
      ...user,
      role: { id: 2, name: 'user', rolePermissions: [] },
    } as unknown as User;
    const savedSession = {
      id: 'session-id',
      userId: 2,
      tokenHash: '',
      expiresAt: new Date(),
    } as RefreshSession;

    userRepository.exists.mockResolvedValue(false);
    roleRepository.findOne.mockResolvedValue(null);
    roleRepository.create.mockReturnValue(role);
    roleRepository.save.mockResolvedValue(role);
    userRepository.create.mockReturnValue(user);
    userRepository.save.mockResolvedValue(user);
    userRepository.findOne.mockResolvedValue(authenticatedUser);
    refreshSessionRepository.create.mockReturnValue(savedSession);
    refreshSessionRepository.save
      .mockResolvedValueOnce(savedSession)
      .mockResolvedValueOnce({ ...savedSession, tokenHash: 'hash' });
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hash' as never);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    await service.register({
      name: 'Novo',
      login: 'novousr',
      password: '123456',
    });

    expect(roleRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'user' }),
    );
    expect(roleRepository.save).toHaveBeenCalled();
  });

  it('deve fazer logout sem token sem lançar erro', async () => {
    await expect(service.logout(undefined)).resolves.toBeUndefined();
  });

  it('deve fazer logout sem lançar erro mesmo com token inválido', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('token inválido'));

    await expect(service.logout('invalid-token')).resolves.toBeUndefined();
  });

  it('deve fazer logout com token válido e revogar sessão', async () => {
    const session = { id: 'session-id', userId: 1, revokedAt: null };

    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      sessionId: 'session-id',
    });
    refreshSessionRepository.findOne.mockResolvedValue(session);
    refreshSessionRepository.save.mockResolvedValue(session);

    await service.logout('token-valido');

    expect(refreshSessionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ revokedAt: expect.any(Date) }),
    );
  });

  it('deve lançar erro quando usuário ficar inativo ao emitir sessão no login', async () => {
    userRepository.findOne
      .mockResolvedValueOnce({
        id: 1,
        login: 'eduardo',
        passwordHash: 'hash',
        isActive: true,
        role: { name: 'user', rolePermissions: [] },
      })
      .mockResolvedValueOnce(null);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    await expect(
      service.login({ login: 'eduardo', password: '123456' }),
    ).rejects.toThrow(
      new ForbiddenException('Usuário inativo ou inexistente.'),
    );
  });
});
