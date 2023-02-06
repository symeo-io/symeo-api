import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';

export class GetEnvironmentValuesResponseDto {
  value: ConfigurationValues;

  constructor(values: ConfigurationValues) {
    this.value = values;
  }
}
