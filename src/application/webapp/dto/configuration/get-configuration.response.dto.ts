import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationDTO from 'src/application/webapp/dto/configuration/configuration.dto';
import { ApiProperty } from '@nestjs/swagger';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { EnvironmentPermissionDTO } from 'src/application/webapp/dto/environment-permission/environment-permission.dto';

export class GetConfigurationResponseDTO {
  @ApiProperty({ type: ConfigurationDTO })
  configuration: ConfigurationDTO;

  @ApiProperty()
  isCurrentUserRepositoryAdmin: boolean;

  @ApiProperty({ type: [EnvironmentPermissionDTO] })
  currentUserEnvironmentsPermissions: EnvironmentPermissionDTO[];

  static fromDomain(
    repository: VcsRepository,
    configuration: Configuration,
    environmentsPermissions: EnvironmentPermission[],
  ) {
    const dto = new GetConfigurationResponseDTO();
    dto.configuration = ConfigurationDTO.fromDomain(configuration);
    dto.isCurrentUserRepositoryAdmin = repository.isCurrentUserAdmin;
    dto.currentUserEnvironmentsPermissions = environmentsPermissions;

    return dto;
  }
}
