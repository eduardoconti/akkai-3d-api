import {
  ConflictException,
  ForbiddenException,
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
          AUTH_COOKIE_SAME_SITE: 'lax',
        };

        return values[key];
      }),
      get: jest.fn((key: string) => {
        if (key === 'NODE_ENV') {
          return 'development';
        }

        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: roleRepository,
        },
        {
          provide: getRepositoryToken(RefreshSession),
          useValue: refreshSessionRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve lançar conflito ao registrar e-mail já existente', async () => {
    userRepository.exists.mockResolvedValue(true);

    await expect(
      service.register(
        {
          name: 'Eduardo',
          email: 'eduardo@email.com',
          password: '123456',
        },
        { cookie: jest.fn() } as never,
      ),
    ).rejects.toThrow(
      new ConflictException('Já existe um usuário com esse e-mail.'),
    );
  });

  it('deve registrar usuário e emitir sessão', async () => {
    const role = { id: 1, name: 'user', description: 'Padrão' } as Role;
    const user = {
      id: 1,
      name: 'Eduardo',
      email: 'eduardo@email.com',
      passwordHash: 'password-hash',
      roleId: 1,
      isActive: true,
    } as User;
    const authenticatedUser = {
      ...user,
      role: {
        id: 1,
        name: 'user',
        rolePermissions: [],
        users: [],
      },
    } as unknown as User;
    const savedSession = {
      id: 'session-id',
      userId: 1,
      tokenHash: '',
      expiresAt: new Date(),
    } as RefreshSession;
    const response = { cookie: jest.fn() };

    userRepository.exists.mockResolvedValue(false);
    roleRepository.findOne.mockResolvedValue(role);
    userRepository.create.mockReturnValue(user);
    userRepository.save.mockResolvedValue(user);
    userRepository.findOne.mockResolvedValue(authenticatedUser);
    refreshSessionRepository.create.mockReturnValue(savedSession);
    refreshSessionRepository.save
      .mockResolvedValueOnce(savedSession)
      .mockResolvedValueOnce({
        ...savedSession,
        tokenHash: 'refresh-hash',
      });
    jest
      .spyOn(bcrypt, 'hash')
      .mockResolvedValueOnce('password-hash' as never)
      .mockResolvedValueOnce('refresh-hash' as never);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await service.register(
      {
        name: 'Eduardo',
        email: 'eduardo@email.com',
        password: '123456',
      },
      response as never,
    );

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Eduardo',
        email: 'eduardo@email.com',
        roleId: 1,
      }),
    );
    expect(response.cookie).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      id: 1,
      name: 'Eduardo',
      email: 'eduardo@email.com',
      role: 'user',
      permissions: [],
    });
  });

  it('deve lançar erro no login com senha inválida', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      email: 'eduardo@email.com',
      passwordHash: 'hash',
      isActive: true,
      role: {
        name: 'user',
        rolePermissions: [],
      },
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(
      service.login({ email: 'eduardo@email.com', password: '123456' }, {
        cookie: jest.fn(),
      } as never),
    ).rejects.toThrow(new UnauthorizedException('E-mail ou senha inválidos.'));
  });

  it('deve lançar erro no refresh sem token', async () => {
    await expect(
      service.refresh(undefined, { cookie: jest.fn() } as never),
    ).rejects.toThrow(new UnauthorizedException('Refresh token ausente.'));
  });

  it('deve lançar erro quando usuário autenticado não existir em me', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.me(1)).rejects.toThrow(
      new UnauthorizedException('Usuário autenticado não encontrado.'),
    );
  });

  it('deve limpar cookies no logout mesmo com token inválido', async () => {
    const response = { clearCookie: jest.fn() };
    jwtService.verifyAsync.mockRejectedValue(new Error('token inválido'));

    await service.logout('invalid-token', response as never);

    expect(response.clearCookie).toHaveBeenCalledTimes(2);
  });

  it('deve lançar erro quando usuário ficar inativo ao emitir sessão no login', async () => {
    userRepository.findOne
      .mockResolvedValueOnce({
        id: 1,
        email: 'eduardo@email.com',
        passwordHash: 'hash',
        isActive: true,
        role: { name: 'user', rolePermissions: [] },
      })
      .mockResolvedValueOnce(null);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    await expect(
      service.login({ email: 'eduardo@email.com', password: '123456' }, {
        cookie: jest.fn(),
      } as never),
    ).rejects.toThrow(
      new ForbiddenException('Usuário inativo ou inexistente.'),
    );
  });
});
