import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  CORS_ORIGIN: Joi.string().trim().min(1).default('http://localhost:5173'),
  DATABASE_HOST: Joi.string().hostname().default('localhost'),
  DATABASE_PORT: Joi.number().integer().min(1).max(65535).default(5432),
  DATABASE_USERNAME: Joi.string().trim().min(1).required(),
  DATABASE_PASSWORD: Joi.string().allow('').required(),
  DATABASE_NAME: Joi.string().trim().min(1).required(),
  DATABASE_SYNCHRONIZE: Joi.boolean().default(false),
  DATABASE_LOGGING: Joi.boolean().default(true),
  JWT_ACCESS_SECRET: Joi.string().trim().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().trim().min(32).required(),
  AUTH_ACCESS_TOKEN_TTL_MINUTES: Joi.number().integer().min(1).default(15),
  AUTH_REFRESH_TOKEN_TTL_DAYS: Joi.number().integer().min(1).default(7),
  AUTH_COOKIE_SAME_SITE: Joi.string()
    .valid('lax', 'strict', 'none')
    .default('lax'),
  AUTH_COOKIE_DOMAIN: Joi.string().allow('').default(''),
  AUTH_BCRYPT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),
}).unknown(true);
