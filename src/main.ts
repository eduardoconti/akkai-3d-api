import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ProblemDetailsExceptionFilter } from './common/filters/problem-details-exception.filter';
import { criarExcecaoValidacao } from './common/validation.exception-factory';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new ProblemDetailsExceptionFilter());
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
  await app.listen(process.env['PORT'] ?? 3000);
}
void bootstrap();
