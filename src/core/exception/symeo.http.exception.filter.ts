import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { SymeoException } from 'src/core/exception/symeo.exception';

@Catch()
export class SymeoHttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();

    if (exception instanceof SymeoException) {
      response.status(exception.statusCode).json({
        statusCode: exception.statusCode,
        symeoExceptionCode: exception.symeoExceptionCode,
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
