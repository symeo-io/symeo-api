import ConfigurationDTO from 'src/application/webapp/dto/configuration/configuration.dto';
import Configuration from 'src/domain/model/configuration/configuration.model';

export class CreateEnvironmentResponseDTO {
  configuration: ConfigurationDTO;

  static fromDomain(
    configuration: Configuration,
  ): CreateEnvironmentResponseDTO {
    const dto = new CreateEnvironmentResponseDTO();
    dto.configuration = ConfigurationDTO.fromDomain(configuration);
    return dto;
  }
}
