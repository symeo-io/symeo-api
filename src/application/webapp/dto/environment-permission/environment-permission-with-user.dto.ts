import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { VcsUserDTO } from 'src/application/webapp/dto/environment-permission/vcs-user.dto';
import { EnvironmentPermissionWithUser } from 'src/domain/model/environment-permission/environment-permission-user.model';
import { EnvironmentPermissionDTO } from 'src/application/webapp/dto/environment-permission/environment-permission.dto';

export class EnvironmentPermissionWithUserDTO extends EnvironmentPermissionDTO {
  @ApiProperty({ type: VcsUserDTO })
  user: VcsUserDTO;

  constructor(
    id: string,
    userVcsId: number,
    user: VcsUserDTO,
    environmentId: string,
    environmentPermissionRole: EnvironmentPermissionRole,
  ) {
    super(id, userVcsId, environmentId, environmentPermissionRole);
    this.user = user;
  }

  static fromDomain(
    environmentPermission: EnvironmentPermissionWithUser,
  ): EnvironmentPermissionWithUserDTO {
    return new EnvironmentPermissionWithUserDTO(
      environmentPermission.id,
      environmentPermission.userVcsId,
      VcsUserDTO.fromDomain(environmentPermission.user),
      environmentPermission.environmentId,
      environmentPermission.environmentPermissionRole,
    );
  }
}
