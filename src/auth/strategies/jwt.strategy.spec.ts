import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@auth/strategies';

describe('JwtStrategy', () => {
  it('deve validar e retornar o payload recebido', () => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('access-secret'),
    } as unknown as ConfigService;
    const strategy = new JwtStrategy(configService);
    const payload = {
      sub: 1,
      email: 'eduardo@email.com',
      role: 'user',
      permissions: ['report.read'],
    };

    expect(strategy.validate(payload)).toBe(payload);
  });
});
