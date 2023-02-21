import ApiKey from 'src/domain/model/environment/api-key.model';
import { ApiProperty } from '@nestjs/swagger';

export default class ApiKeyDTO {
  @ApiProperty()
  id: string;
  @ApiProperty()
  environmentId: string;
  @ApiProperty()
  key?: string;
  @ApiProperty()
  hiddenKey: string;
  @ApiProperty()
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
