import ApiKey from 'src/domain/model/configuration/api-key.model';
import { ApiProperty } from '@nestjs/swagger';

export default class ApiKeyDTO {
  @ApiProperty()
  id: string;
  @ApiProperty()
  environmentId: string;
  @ApiProperty()
  key: string;
  @ApiProperty()
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
