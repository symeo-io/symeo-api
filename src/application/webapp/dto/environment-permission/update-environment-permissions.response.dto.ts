import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentPermissionDTO } from 'src/application/webapp/dto/environment-permission/environment-permission.dto';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';

export class UpdateEnvironmentPermissionsResponseDTO {
  @ApiProperty({ type: [EnvironmentPermissionDTO] })
  environmentPermissionDTOS: EnvironmentPermissionDTO[];

  static fromDomains(environmentPermissions: EnvironmentPermission[]) {
    const dto = new UpdateEnvironmentPermissionsResponseDTO();
    dto.environmentPermissionDTOS = environmentPermissions.map(
      EnvironmentPermissionDTO.fromDomain,
    );
    return dto;
  }
}
