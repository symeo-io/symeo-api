import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { UpdateEnvironmentPermissionDTO } from 'src/application/webapp/dto/environment-permission/update-environment-permission.dto';
import { IsArray, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EnvironmentPermissionDTO } from 'src/application/webapp/dto/environment-permission/environment-permission-response.dto';

export class UpdateEnvironmentPermissionsDTO {
  @ApiProperty({ type: [UpdateEnvironmentPermissionDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEnvironmentPermissionDTO)
  environmentPermissionsDTO: UpdateEnvironmentPermissionDTO[];

  static toDomains(
    updateEnvironmentPermissionsDTO: UpdateEnvironmentPermissionDTO[],
  ): EnvironmentPermission[] {
    const environmentPermissions: EnvironmentPermission[] = [];
    updateEnvironmentPermissionsDTO.map((updateEnvironmentPermissionDTO) =>
      environmentPermissions.push(
        UpdateEnvironmentPermissionDTO.toDomain(updateEnvironmentPermissionDTO),
      ),
    );
    return environmentPermissions;
  }
}
