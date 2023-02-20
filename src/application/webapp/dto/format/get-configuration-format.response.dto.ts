import { ConfigurationFormat } from 'src/domain/model/configuration/configuration-format.model';
import { ApiProperty } from '@nestjs/swagger';

export class GetConfigurationFormatResponseDTO {
  @ApiProperty()
  format: ConfigurationFormat;

  constructor(format: ConfigurationFormat) {
    this.format = format;
  }
}
