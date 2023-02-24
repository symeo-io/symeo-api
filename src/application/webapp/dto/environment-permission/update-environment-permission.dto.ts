import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';

export class UpdateEnvironmentPermissionDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  userVcsId: number;
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(EnvironmentPermissionRole)
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

  static toDomain(
    updateEnvironmentPermissionDTO: UpdateEnvironmentPermissionDTO,
  ): EnvironmentPermission {
    return new EnvironmentPermission(
      updateEnvironmentPermissionDTO.id,
      updateEnvironmentPermissionDTO.userVcsId,
      updateEnvironmentPermissionDTO.environmentPermissionRole,
    );
  }
}
