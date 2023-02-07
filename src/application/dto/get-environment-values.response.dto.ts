import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';

export class GetEnvironmentValuesResponseDTO {
  values: ConfigurationValues;

  constructor(values: ConfigurationValues) {
    this.values = values;
  }
}
