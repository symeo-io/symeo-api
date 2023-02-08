import ApiKey from 'src/domain/model/configuration/api-key.model';

export default class ApiKeyDTO {
  id: string;
  environmentId: string;
  key: string;
  createdAt: string;

  static fromDomain(apiKey: ApiKey, hideKey = true) {
    const dto = new ApiKeyDTO();
    dto.id = apiKey.id;
    dto.environmentId = apiKey.environmentId;
    dto.createdAt = apiKey.createdAt.toISOString();

    dto.key = hideKey ? ApiKeyDTO.hideKey(apiKey.key) : apiKey.key;

    return dto;
  }

  static hideKey(key: string): string {
    return '••••••••••••' + key.slice(-4);
  }
}
