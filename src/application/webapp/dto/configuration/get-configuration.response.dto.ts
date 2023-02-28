import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationDTO from 'src/application/webapp/dto/configuration/configuration.dto';
import { ApiProperty } from '@nestjs/swagger';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';

export class GetConfigurationResponseDTO {
  @ApiProperty()
  configuration: ConfigurationDTO;
  @ApiProperty()
  isCurrentUserVcsRepositoryAdmin: boolean;

  static fromDomain(repository: VcsRepository, configuration: Configuration) {
    const dto = new GetConfigurationResponseDTO();
    dto.configuration = ConfigurationDTO.fromDomain(configuration);

    return dto;
  }
}
