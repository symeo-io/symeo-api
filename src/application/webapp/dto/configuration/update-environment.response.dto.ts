import ConfigurationDTO from 'src/application/webapp/dto/configuration/configuration.dto';
import Configuration from 'src/domain/model/configuration/configuration.model';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEnvironmentResponseDTO {
  @ApiProperty()
  configuration: ConfigurationDTO;

  static fromDomain(
    configuration: Configuration,
  ): UpdateEnvironmentResponseDTO {
    const dto = new UpdateEnvironmentResponseDTO();
    dto.configuration = ConfigurationDTO.fromDomain(configuration);
    return dto;
  }
}
