import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';

export const SymeoExceptionCodeToHttpStatusMap = {
  [SymeoExceptionCode.CONFIGURATION_NOT_FOUND]: 404,
  [SymeoExceptionCode.REPOSITORY_NOT_FOUND]: 404,
  [SymeoExceptionCode.ENVIRONMENT_NOT_FOUND]: 404,
  [SymeoExceptionCode.API_KEY_NOT_FOUND]: 404,
  [SymeoExceptionCode.COMMITTING_FILE_ERROR]: 400,
  [SymeoExceptionCode.CONFIGURATION_CONTRACT_NOT_FOUND]: 404,
  [SymeoExceptionCode.VALUES_VERSION_NOT_FOUND]: 404,
  [SymeoExceptionCode.UPDATE_ADMINISTRATOR_PERMISSION]: 400,
  [SymeoExceptionCode.RESOURCE_ACCESS_DENIED]: 403,
  [SymeoExceptionCode.TOKEN_REFRESH_FAILURE]: 401,
};
