import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCodeMapper } from 'src/application/exception/symeo.exception.code.mapper';

@Catch()
export class SymeoExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();

    if (exception instanceof SymeoException) {
      const statusCode: number =
        SymeoExceptionCodeMapper[exception.symeoExceptionCode];
      response.status(statusCode).json({
        statusCode: statusCode,
        message: exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      response.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
