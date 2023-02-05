import { HttpException } from '@nestjs/common';
import { SymeoExceptionCode } from 'src/core/exception/symeo.exception.code.enum';

export class SymeoException extends HttpException {
  statusCode: number;
  symeoExceptionCode: SymeoExceptionCode;
  errorMessage: string;
  rootException: HttpException;

  constructor(
    errorMessage: string | Record<string, any>,
    statusCode: number,
    symeoExceptionCode: SymeoExceptionCode,
    rootException: HttpException,
  ) {
    super(errorMessage, statusCode);
    this.statusCode = statusCode;
    this.symeoExceptionCode = symeoExceptionCode;
    this.errorMessage = errorMessage as string;
    this.rootException = rootException;
  }
}
