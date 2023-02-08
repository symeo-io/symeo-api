import ApiKeyDTO from 'src/application/dto/api-key/api-key.dto';
import ApiKey from 'src/domain/model/configuration/api-key.model';

export default class GetApiKeysResponseDTO {
  apiKeys: ApiKeyDTO[];

  static fromDomains(apiKeys: ApiKey[]) {
    const dto = new GetApiKeysResponseDTO();
    dto.apiKeys = apiKeys.map((apiKey) => ApiKeyDTO.fromDomain(apiKey, true));

    return dto;
  }
}
