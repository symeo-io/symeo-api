import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import { IsObject } from 'class-validator';

export class SetEnvironmentValuesResponseDTO {
  @IsObject()
  values: ConfigurationValues;
}
