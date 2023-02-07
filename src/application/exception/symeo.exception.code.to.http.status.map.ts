import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';

export const SymeoExceptionCodeToHttpStatusMap = {
  [SymeoExceptionCode.CONFIGURATION_NOT_FOUND]: 404,
  [SymeoExceptionCode.REPOSITORY_NOT_FOUND]: 404,
  [SymeoExceptionCode.ENVIRONMENT_NOT_FOUND]: 404,
  [SymeoExceptionCode.WRONG_REPOSITORY_DETAILS]: 400,
  [SymeoExceptionCode.WRONG_CONFIG_FILE_DETAILS]: 400,
};
