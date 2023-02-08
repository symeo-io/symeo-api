import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationDTO from 'src/application/webapp/dto/configuration/configuration.dto';

export class GetConfigurationResponseDTO {
  configuration: ConfigurationDTO;

  static fromDomain(configuration: Configuration) {
    const dto = new GetConfigurationResponseDTO();
    dto.configuration = ConfigurationDTO.fromDomain(configuration);

    return dto;
  }
}
