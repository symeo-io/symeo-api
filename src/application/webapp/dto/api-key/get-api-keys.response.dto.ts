import ApiKeyDTO from 'src/application/webapp/dto/api-key/api-key.dto';
import ApiKey from 'src/domain/model/environment/api-key.model';
import { ApiProperty } from '@nestjs/swagger';

export default class GetApiKeysResponseDTO {
  @ApiProperty({ type: [ApiKeyDTO] })
  apiKeys: ApiKeyDTO[];

  static fromDomains(apiKeys: ApiKey[]) {
    const dto = new GetApiKeysResponseDTO();
    dto.apiKeys = apiKeys.map((apiKey) => ApiKeyDTO.fromDomain(apiKey));

    return dto;
  }
}
