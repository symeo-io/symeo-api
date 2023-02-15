import './tracing';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'symeo-js/config';
import { SymeoExceptionHttpFilter } from 'src/application/common/exception/symeo.exception.http.filter';
import { ApplicationModule } from 'src/bootstrap/application.module';
import { createLogger, format, transports } from 'winston';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  const instance = createLogger({
    level: 'info',
    format: format.json(),
    transports: [new transports.Console()],
  });
  const app = await NestFactory.create(ApplicationModule, {
    logger: WinstonModule.createLogger({ instance }),
  });
  app.useGlobalFilters(new SymeoExceptionHttpFilter());
  app.enableCors({
    credentials: true,
    origin: config.cors.origin,
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(9999);
}
bootstrap();
