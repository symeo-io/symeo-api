import './tracing';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { config } from 'symeo-js/config';
import { SymeoExceptionHttpFilter } from 'src/application/common/exception/symeo.exception.http.filter';
import { ApplicationModule } from 'src/bootstrap/application.module';
import { createLogger, format, transports } from 'winston';
import { WinstonModule } from 'nest-winston';
import { Interceptor } from 'src/interceptor';

async function bootstrap() {
  let instance: any = new Logger();
  let loggerOptions = {};

  if (!config.logger.local) {
    instance = createLogger({
      level: 'info',
      format: format.json(),
      transports: [new transports.Console()],
    });
    loggerOptions = {
      logger: WinstonModule.createLogger({ instance }),
    };
  }

  const app = await NestFactory.create(ApplicationModule, loggerOptions);
  app.useGlobalFilters(new SymeoExceptionHttpFilter());
  app.enableCors({
    credentials: true,
    origin: config.cors.origin,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new Interceptor(instance));
  await app.listen(9999);
}
bootstrap();
