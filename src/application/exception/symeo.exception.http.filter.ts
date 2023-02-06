import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCodeToHttpStatusMap } from 'src/application/exception/symeo.exception.code.to.http.status.map';

@Catch()
export class SymeoExceptionHttpFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();

    if (exception instanceof SymeoException) {
      const statusCode: number =
        SymeoExceptionCodeToHttpStatusMap[exception.symeoExceptionCode];
      response.status(statusCode).json({
        statusCode: statusCode,
        message: exception.errorMessage,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
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
