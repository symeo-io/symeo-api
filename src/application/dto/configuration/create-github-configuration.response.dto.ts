import ConfigurationDTO from 'src/application/dto/configuration/configuration.dto';
import Configuration from 'src/domain/model/configuration/configuration.model';

export class CreateGitHubConfigurationResponseDTO {
  configuration: ConfigurationDTO;

  static fromDomain(configuration: Configuration) {
    const dto = new CreateGitHubConfigurationResponseDTO();
    dto.configuration = ConfigurationDTO.fromDomain(configuration);

    return dto;
  }
}
