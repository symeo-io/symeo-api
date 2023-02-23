import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { ApiProperty } from '@nestjs/swagger';

export class EnvironmentPermissionDTO {
  @ApiProperty()
  id: string;
  @ApiProperty({
    type: 'object',
    properties: {
      userVcsId: {
        type: 'number',
      },
      userName: {
        type: 'string',
      },
      userAvatarUrl: {
        type: 'string',
      },
    },
  })
  user: { userVcsId: number; userName: string; userAvatarUrl: string };
  @ApiProperty({
    type: 'object',
    properties: {
      environmentId: {
        type: 'string',
      },
      environmentName: {
        type: 'string',
      },
    },
  })
  environment: { environmentId: string; environmentName: string };
  @ApiProperty({ enum: EnvironmentPermissionRole })
  environmentPermissionRole: EnvironmentPermissionRole;

  constructor(
    id: string,
    user: { userVcsId: number; userName: string; userAvatarUrl: string },
    environment: { environmentId: string; environmentName: string },
    environmentPermissionRole: EnvironmentPermissionRole,
  ) {
    this.id = id;
    this.user = user;
    this.environment = environment;
    this.environmentPermissionRole = environmentPermissionRole;
  }

  static fromDomain(
    environmentPermission: EnvironmentPermission,
  ): EnvironmentPermissionDTO {
    return new EnvironmentPermissionDTO(
      environmentPermission.id,
      {
        userVcsId: environmentPermission.userVcsId,
        userName: environmentPermission.userName
          ? environmentPermission.userName
          : '',
        userAvatarUrl: environmentPermission.userAvatarUrl
          ? environmentPermission.userAvatarUrl
          : '',
      },
      {
        environmentId: environmentPermission.environment.id,
        environmentName: environmentPermission.environment.name,
      },
      environmentPermission.environmentPermissionRole,
    );
  }
}
