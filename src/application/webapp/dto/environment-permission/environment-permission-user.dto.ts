import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentPermissionUser } from 'src/domain/model/environment-permission/environment-permission-user.model';
import { EnvironmentPermissionDTO } from 'src/application/webapp/dto/environment-permission/environment-permission.dto';

export class EnvironmentPermissionUserDTO {
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
  user: { vcsId: number; name: string; avatarUrl: string };
  @ApiProperty({ type: EnvironmentPermissionDTO })
  environmentPermission: EnvironmentPermissionDTO;

  constructor(
    user: { vcsId: number; name: string; avatarUrl: string },
    environmentPermission: EnvironmentPermissionDTO,
  ) {
    this.user = user;
    this.environmentPermission = environmentPermission;
  }

  static fromDomain(
    environmentPermissionUser: EnvironmentPermissionUser,
  ): EnvironmentPermissionUserDTO {
    return new EnvironmentPermissionUserDTO(
      {
        vcsId: environmentPermissionUser.user.vcsId,
        name: environmentPermissionUser.user.name,
        avatarUrl: environmentPermissionUser.user.avatarUrl,
      },
      EnvironmentPermissionDTO.fromDomain(environmentPermissionUser.permission),
    );
  }
}
