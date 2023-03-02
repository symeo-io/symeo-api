import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { UpdateEnvironmentPermissionDTO } from 'src/application/webapp/dto/environment-permission/update-environment-permission.dto';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEnvironmentPermissionsDTO {
  @ApiProperty({ type: [UpdateEnvironmentPermissionDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEnvironmentPermissionDTO)
  permissions: UpdateEnvironmentPermissionDTO[];

  static toDomains(
    updateEnvironmentPermissionsDTO: UpdateEnvironmentPermissionDTO[],
    environmentId: string,
  ): EnvironmentPermission[] {
    const environmentPermissions: EnvironmentPermission[] = [];
    updateEnvironmentPermissionsDTO.map((updateEnvironmentPermissionDTO) =>
      environmentPermissions.push(
        UpdateEnvironmentPermissionDTO.toDomain(
          updateEnvironmentPermissionDTO,
          environmentId,
        ),
      ),
    );
    return environmentPermissions;
  }
}
