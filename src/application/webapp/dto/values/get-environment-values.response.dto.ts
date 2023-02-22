import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import { ApiProperty } from '@nestjs/swagger';

export class GetEnvironmentValuesResponseDTO {
  @ApiProperty()
  values: ConfigurationValues;

  constructor(values: ConfigurationValues) {
    this.values = values;
  }
}
