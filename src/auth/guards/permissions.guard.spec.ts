import { ForbiddenException } from '@nestjs/common';
import { PermissionsGuard } from '@auth/guards';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    guard = new PermissionsGuard(reflector as never);
  });

  it('deve permitir rota pública', () => {
    reflector.getAllAndOverride.mockReturnValueOnce(true);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };

    expect(guard.canActivate(context as never)).toBe(true);
  });

  it('deve permitir quando não houver permissões exigidas', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(undefined);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(),
    };

    expect(guard.canActivate(context as never)).toBe(true);
  });

  it('deve permitir quando usuário possuir todas as permissões', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['relatorio.ler']);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { permissions: ['relatorio.ler', 'carteira.alterar'] },
        }),
      }),
    };

    expect(guard.canActivate(context as never)).toBe(true);
  });

  it('deve lançar erro quando faltar permissão', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['relatorio.ler']);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { permissions: ['carteira.alterar'] },
        }),
      }),
    };

    expect(() => guard.canActivate(context as never)).toThrow(
      new ForbiddenException('Você não possui permissão para esta ação.'),
    );
  });
});
