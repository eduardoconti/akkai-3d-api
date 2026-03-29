import 'dotenv/config';
import { DataSource } from 'typeorm';
import { envValidationSchema } from './env.validation';
import { getDatabaseConfig } from './database.config';

type ValidatedEnv = {
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  DATABASE_SYNCHRONIZE: boolean;
  DATABASE_LOGGING: boolean;
};

const validationResult = envValidationSchema.validate(process.env, {
  abortEarly: false,
});

const { error } = validationResult;

if (error) {
  throw error;
}

const value = validationResult.value as ValidatedEnv;

export default new DataSource(
  getDatabaseConfig({
    DATABASE_HOST: value.DATABASE_HOST,
    DATABASE_PORT: value.DATABASE_PORT,
    DATABASE_USERNAME: value.DATABASE_USERNAME,
    DATABASE_PASSWORD: value.DATABASE_PASSWORD,
    DATABASE_NAME: value.DATABASE_NAME,
    DATABASE_SYNCHRONIZE: value.DATABASE_SYNCHRONIZE,
    DATABASE_LOGGING: value.DATABASE_LOGGING,
  }),
);
