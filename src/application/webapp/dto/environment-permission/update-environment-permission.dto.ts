import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEnvironmentPermissionDTO {
  @ApiProperty()
  id: string;
  @ApiProperty()
  userVcsId: number;
  @ApiProperty()
  environmentPermissionRole: EnvironmentPermissionRole;

  constructor(
    id: string,
    userVcsId: number,
    environmentPermissionRole: EnvironmentPermissionRole,
  ) {
    this.id = id;
    this.userVcsId = userVcsId;
    this.environmentPermissionRole = environmentPermissionRole;
  }
}
