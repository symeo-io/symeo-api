import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { SymeoHttpException } from 'src/domain/exception/symeo.http.exception';
import { SymeoHttpExceptionCodeMapper } from 'src/application/exception/symeo.http.exception.code.mapper';

@Catch()
export class SymeoHttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();

    if (exception instanceof SymeoHttpException) {
      const statusCode: number =
        SymeoHttpExceptionCodeMapper[exception.symeoExceptionCode];
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
