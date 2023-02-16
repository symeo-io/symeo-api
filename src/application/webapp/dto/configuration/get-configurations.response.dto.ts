import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationDTO from 'src/application/webapp/dto/configuration/configuration.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetConfigurationsResponseDTO {
  @ApiProperty()
  configurations: ConfigurationDTO[];

  static fromDomains(configurations: Configuration[]) {
    const dto = new GetConfigurationsResponseDTO();
    dto.configurations = configurations.map(ConfigurationDTO.fromDomain);

    return dto;
  }
}
