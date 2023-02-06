import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { HttpException } from '@nestjs/common';
import { SymeoExceptionCodeMapper } from 'src/application/exception/symeo.exception.code.mapper';

export class SymeoException extends HttpException {
  symeoExceptionCode: SymeoExceptionCode;
  errorMessage: string;

  constructor(
    errorMessage: string | Record<string, any>,
    symeoExceptionCode: SymeoExceptionCode,
  ) {
    super(errorMessage, SymeoExceptionCodeMapper[symeoExceptionCode]);
    this.symeoExceptionCode = symeoExceptionCode;
    this.errorMessage = errorMessage as string;
  }
}
