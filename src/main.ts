import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { configurarSwagger } from '@common/docs/swagger.config';
import { ProblemDetailsExceptionFilter } from '@common/filters/problem-details-exception.filter';
import { criarExcecaoValidacao } from '@common/validation.exception-factory';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const corsOrigins = configService
    .getOrThrow<string>('CORS_ORIGIN')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const isProduction =
    configService.getOrThrow<string>('NODE_ENV') === 'production';
  const httpAdapter = app.getHttpAdapter().getInstance() as {
    set: (name: string, value: number) => void;
  };

  httpAdapter.set('trust proxy', 1);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });
  app.useGlobalFilters(new ProblemDetailsExceptionFilter());
  configurarSwagger(app);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      validationError: {
        target: false,
        value: false,
      },
      exceptionFactory: criarExcecaoValidacao,
    }),
  );
  if (isProduction) {
    app.enableShutdownHooks();
  }
  await app.listen(configService.getOrThrow<number>('PORT'));
}
void bootstrap();
