import { getDatabaseConfig } from './database.config';
import { envValidationSchema } from './env.validation';

const ambienteBase = {
  NODE_ENV: 'development' as const,
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: 5432,
  DATABASE_USERNAME: 'usuario',
  DATABASE_PASSWORD: 'senha',
  DATABASE_NAME: 'akkai',
  DATABASE_SSL: false,
  DATABASE_SYNCHRONIZE: false,
  DATABASE_LOGGING: false,
};

describe('configuração do banco de dados', () => {
  it('deve desativar synchronize defensivamente em produção', () => {
    const config = getDatabaseConfig({
      ...ambienteBase,
      NODE_ENV: 'production',
      DATABASE_SYNCHRONIZE: true,
    });

    expect(config.synchronize).toBe(false);
  });

  it('deve usar logging desativado por padrão', () => {
    const resultado = envValidationSchema.validate({
      DATABASE_USERNAME: 'usuario',
      DATABASE_PASSWORD: 'senha',
      DATABASE_NAME: 'akkai',
      JWT_ACCESS_SECRET: 'a'.repeat(32),
      JWT_REFRESH_SECRET: 'b'.repeat(32),
    });

    const valor = resultado.value as unknown;

    expect(resultado.error).toBeUndefined();
    expect(valor).toEqual(expect.objectContaining({ DATABASE_LOGGING: false }));
  });

  it('deve rejeitar synchronize habilitado em produção', () => {
    const { error } = envValidationSchema.validate({
      NODE_ENV: 'production',
      DATABASE_USERNAME: 'usuario',
      DATABASE_PASSWORD: 'senha',
      DATABASE_NAME: 'akkai',
      DATABASE_SYNCHRONIZE: true,
      JWT_ACCESS_SECRET: 'a'.repeat(32),
      JWT_REFRESH_SECRET: 'b'.repeat(32),
    });

    expect(error?.message).toContain(
      'DATABASE_SYNCHRONIZE deve permanecer desativado em produção.',
    );
  });
});
