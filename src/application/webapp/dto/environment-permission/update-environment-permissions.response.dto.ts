import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { EnvironmentPermissionDTO } from 'src/application/webapp/dto/environment-permission/environment-permission.dto';

export class UpdateEnvironmentPermissionsResponseDTO {
  @ApiProperty({ type: [EnvironmentPermissionDTO] })
  permissions: EnvironmentPermissionDTO[];

  static fromDomains(environmentPermissions: EnvironmentPermission[]) {
    const dto = new UpdateEnvironmentPermissionsResponseDTO();
    dto.permissions = environmentPermissions.map(
      EnvironmentPermissionDTO.fromDomain,
    );
    return dto;
  }
}
