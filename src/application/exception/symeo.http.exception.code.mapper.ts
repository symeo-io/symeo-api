import { SymeoHttpExceptionCode } from 'src/domain/exception/symeo.http.exception.code.enum';

export const SymeoHttpExceptionCodeMapper = {
  [SymeoHttpExceptionCode.CONFIGURATION_NOT_FOUND]: 404,
  [SymeoHttpExceptionCode.REPOSITORY_NOT_FOUND]: 404,
  [SymeoHttpExceptionCode.WRONG_REPOSITORY_DETAILS]: 400,
  [SymeoHttpExceptionCode.WRONG_CONFIG_FILE_DETAILS]: 400,
};
