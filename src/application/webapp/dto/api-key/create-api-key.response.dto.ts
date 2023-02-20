import ApiKeyDTO from 'src/application/webapp/dto/api-key/api-key.dto';
import ApiKey from 'src/domain/model/configuration/api-key.model';
import { ApiProperty } from '@nestjs/swagger';

export default class CreateApiKeyResponseDTO {
  @ApiProperty()
  apiKey: ApiKeyDTO;

  static fromDomain(apiKey: ApiKey) {
    const dto = new CreateApiKeyResponseDTO();
    dto.apiKey = ApiKeyDTO.fromDomain(apiKey, false);

    return dto;
  }
}
