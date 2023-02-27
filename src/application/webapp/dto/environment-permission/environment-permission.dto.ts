import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';

export class EnvironmentPermissionDTO {
  @ApiProperty()
  id: string;
  @ApiProperty()
  userVcsId: number;
  @ApiProperty()
  environmentId: string;
  @ApiProperty({ enum: EnvironmentPermissionRole })
  environmentPermissionRole: EnvironmentPermissionRole;

  constructor(
    id: string,
    userVcsId: number,
    environmentId: string,
    environmentPermissionRole: EnvironmentPermissionRole,
  ) {
    this.id = id;
    this.userVcsId = userVcsId;
    this.environmentId = environmentId;
    this.environmentPermissionRole = environmentPermissionRole;
  }

  static fromDomain(
    environmentPermission: EnvironmentPermission,
  ): EnvironmentPermissionDTO {
    return new EnvironmentPermissionDTO(
      environmentPermission.id,
      environmentPermission.userVcsId,
      environmentPermission.environmentId,
      environmentPermission.environmentPermissionRole,
    );
  }
}
