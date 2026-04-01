import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '@auth/guards';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    guard = new JwtAuthGuard(reflector as never);
  });

  it('deve permitir rota pública', () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };

    expect(guard.canActivate(context as never)).toBe(true);
  });

  it('deve retornar usuário autenticado no handleRequest', () => {
    const user = { id: 1 };

    expect(guard.handleRequest(null, user)).toBe(user);
  });

  it('deve lançar erro quando não houver usuário autenticado', () => {
    expect(() => guard.handleRequest(null, null)).toThrow(
      new UnauthorizedException('Autenticação inválida ou ausente.'),
    );
  });
});
