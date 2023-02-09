import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { config } from '@symeo-io/symeo/config';
import { SymeoExceptionHttpFilter } from 'src/application/common/exception/symeo.exception.http.filter';
import { ApplicationModule } from 'src/bootstrap/application.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  app.useGlobalFilters(new SymeoExceptionHttpFilter());
  app.enableCors({
    credentials: true,
    origin: config.cors.origin,
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(9999);
}
bootstrap();
