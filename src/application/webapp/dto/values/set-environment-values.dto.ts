import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetEnvironmentValuesResponseDTO {
  @ApiProperty()
  @IsObject()
  values: ConfigurationValues;
}
