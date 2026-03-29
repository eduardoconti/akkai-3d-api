import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips properties not defined in the DTO
      transform: true, // Automatically transforms payload to DTO instance types
      forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are present
    }),
  );
  await app.listen(process.env['PORT'] ?? 3000);
}
void bootstrap();
