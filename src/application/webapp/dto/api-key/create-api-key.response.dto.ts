import ApiKeyDTO from 'src/application/webapp/dto/api-key/api-key.dto';
import ApiKey from 'src/domain/model/configuration/api-key.model';

export default class CreateApiKeyResponseDTO {
  apiKey: ApiKeyDTO;

  static fromDomain(apiKey: ApiKey) {
    const dto = new CreateApiKeyResponseDTO();
    dto.apiKey = ApiKeyDTO.fromDomain(apiKey);

    return dto;
  }
}
