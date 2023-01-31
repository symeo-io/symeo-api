import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from 'src/bootstrap/application.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { config } from 'symeo/config';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  app.enableCors({
    credentials: true,
    origin: config.cors.origin,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalGuards(new (AuthGuard('jwt'))());
  await app.listen(9999);
}
bootstrap();
