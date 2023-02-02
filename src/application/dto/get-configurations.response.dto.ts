import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationDTO from 'src/application/dto/configuration.dto';

export class GetConfigurationsResponseDTO {
  configurations: ConfigurationDTO[];

  static fromDomains(configurations: Configuration[]) {
    const dto = new GetConfigurationsResponseDTO();
    dto.configurations = configurations.map(ConfigurationDTO.fromDomain);

    return dto;
  }
}
