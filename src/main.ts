import './tracing';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'symeo-js/config';
import { SymeoExceptionHttpFilter } from 'src/application/common/exception/symeo.exception.http.filter';
import { ApplicationModule } from 'src/bootstrap/application.module';
import { createLogger, format, level, transports } from 'winston';
import { WinstonModule } from 'nest-winston';
import { Interceptor } from 'src/interceptor';
import { WinstonLogger } from 'src/logger';

async function bootstrap() {
  const winstonLogger = new WinstonLogger();
  const loggerInstance = createLogger({
    level: 'info',
    format: winstonLogger.getLogFormat(),
    transports: [new transports.Console({ level: 'info' })],
  });
  const app = await NestFactory.create(
    ApplicationModule,
    config.logger.local
      ? {}
      : { logger: WinstonModule.createLogger(loggerInstance) },
  );
  app.useGlobalFilters(new SymeoExceptionHttpFilter());
  app.enableCors({
    credentials: true,
    origin: config.cors.origin,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new Interceptor(loggerInstance));
  await app.listen(9999);
}

bootstrap();
