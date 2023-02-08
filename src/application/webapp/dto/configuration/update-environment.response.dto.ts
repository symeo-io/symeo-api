import ConfigurationDTO from 'src/application/webapp/dto/configuration/configuration.dto';
import Configuration from 'src/domain/model/configuration/configuration.model';

export class UpdateEnvironmentResponseDto {
  configuration: ConfigurationDTO;

  static fromDomain(
    configuration: Configuration,
  ): UpdateEnvironmentResponseDto {
    const dto = new UpdateEnvironmentResponseDto();
    dto.configuration = ConfigurationDTO.fromDomain(configuration);
    return dto;
  }
}
