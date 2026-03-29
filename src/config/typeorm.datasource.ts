import 'dotenv/config';
import { DataSource } from 'typeorm';
import { envValidationSchema } from './env.validation';
import { getDatabaseConfig } from './database.config';

const { error, value } = envValidationSchema.validate(process.env, {
  abortEarly: false,
});

if (error) {
  throw error;
}

export default new DataSource(
  getDatabaseConfig({
    DATABASE_HOST: String(value.DATABASE_HOST),
    DATABASE_PORT: Number(value.DATABASE_PORT),
    DATABASE_USERNAME: String(value.DATABASE_USERNAME),
    DATABASE_PASSWORD: String(value.DATABASE_PASSWORD),
    DATABASE_NAME: String(value.DATABASE_NAME),
    DATABASE_SYNCHRONIZE: Boolean(value.DATABASE_SYNCHRONIZE),
    DATABASE_LOGGING: Boolean(value.DATABASE_LOGGING),
  }),
);
