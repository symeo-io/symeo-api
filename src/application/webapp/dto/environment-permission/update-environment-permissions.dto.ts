import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { UpdateEnvironmentPermissionDTO } from 'src/application/webapp/dto/environment-permission/update-environment-permission.dto';

export class UpdateEnvironmentPermissionsDTO {
  @ApiProperty({ type: [UpdateEnvironmentPermissionDTO] })
  environmentPermissionDTOS: UpdateEnvironmentPermissionDTO[];

  toDomain(): EnvironmentPermission[] {
    return this.environmentPermissionDTOS.map((environmentPermissionDTO) => {
      return new EnvironmentPermission(
        environmentPermissionDTO.id,
        environmentPermissionDTO.userVcsId,
        environmentPermissionDTO.environmentPermissionRole,
      );
    });
  }
}
