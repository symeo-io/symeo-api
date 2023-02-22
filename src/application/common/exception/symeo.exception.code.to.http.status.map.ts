import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';

export const SymeoExceptionCodeToHttpStatusMap = {
  [SymeoExceptionCode.CONFIGURATION_NOT_FOUND]: 404,
  [SymeoExceptionCode.REPOSITORY_NOT_FOUND]: 404,
  [SymeoExceptionCode.ENVIRONMENT_NOT_FOUND]: 404,
  [SymeoExceptionCode.API_KEY_NOT_FOUND]: 404,
  [SymeoExceptionCode.CONFIGURATION_CONTRACT_NOT_FOUND]: 404,
};
