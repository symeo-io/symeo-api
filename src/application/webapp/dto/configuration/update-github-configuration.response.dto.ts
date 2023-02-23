import ConfigurationDTO from 'src/application/webapp/dto/configuration/configuration.dto';
import Configuration from 'src/domain/model/configuration/configuration.model';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGitHubConfigurationResponseDTO {
  @ApiProperty()
  configuration: ConfigurationDTO;

  static fromDomain(configuration: Configuration) {
    const dto = new UpdateGitHubConfigurationResponseDTO();
    dto.configuration = ConfigurationDTO.fromDomain(configuration);

    return dto;
  }
}
