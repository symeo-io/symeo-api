import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationDTO from 'src/application/webapp/dto/configuration/configuration.dto';
import { ApiProperty } from '@nestjs/swagger';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';

export class GetConfigurationsResponseDTO {
  @ApiProperty({ type: [ConfigurationDTO] })
  configurations: ConfigurationDTO[];
  @ApiProperty()
  isCurrentUserVcsRepositoryAdmin: boolean;

  static fromDomains(
    repository: VcsRepository,
    configurations: Configuration[],
  ) {
    const dto = new GetConfigurationsResponseDTO();
    dto.configurations = configurations.map(ConfigurationDTO.fromDomain);
    dto.isCurrentUserVcsRepositoryAdmin =
      repository.isCurrentUserVcsRepositoryAdmin;

    return dto;
  }
}
