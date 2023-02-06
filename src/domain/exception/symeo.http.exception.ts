import { SymeoHttpExceptionCode } from 'src/domain/exception/symeo.http.exception.code.enum';
import { HttpException } from '@nestjs/common';
import { SymeoHttpExceptionCodeMapper } from 'src/application/exception/symeo.http.exception.code.mapper';

export class SymeoHttpException extends HttpException {
  symeoExceptionCode: SymeoHttpExceptionCode;
  errorMessage: string;

  constructor(
    errorMessage: string | Record<string, any>,
    symeoExceptionCode: SymeoHttpExceptionCode,
  ) {
    super(errorMessage, SymeoHttpExceptionCodeMapper[symeoExceptionCode]);
    this.symeoExceptionCode = symeoExceptionCode;
    this.errorMessage = errorMessage as string;
  }
}
