import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';

export class SymeoException {
  symeoExceptionCode: SymeoExceptionCode;
  errorMessage: string;

  constructor(
    errorMessage: string | Record<string, any>,
    symeoExceptionCode: SymeoExceptionCode,
  ) {
    this.symeoExceptionCode = symeoExceptionCode;
    this.errorMessage = errorMessage as string;
  }
}
