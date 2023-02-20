import ApiKey from 'src/domain/model/configuration/api-key.model';

export default class ApiKeyDTO {
  id: string;
  environmentId: string;
  key?: string;
  hiddenKey: string;
  createdAt: string;

  static fromDomain(apiKey: ApiKey) {
    const dto = new ApiKeyDTO();
    dto.id = apiKey.id;
    dto.environmentId = apiKey.environmentId;
    dto.createdAt = apiKey.createdAt.toISOString();
    dto.key = apiKey.key;
    dto.hiddenKey = apiKey.hiddenKey;

    return dto;
  }
}
