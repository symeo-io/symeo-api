import { ConfigurationFormat } from 'src/domain/model/configuration/configuration-format.model';

export class GetConfigurationFormatResponseDTO {
  format: ConfigurationFormat;

  constructor(format: ConfigurationFormat) {
    this.format = format;
  }
}
