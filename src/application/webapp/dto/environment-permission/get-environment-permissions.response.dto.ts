import { EnvironmentPermissionDTO } from 'src/application/webapp/dto/environment-permission/environment-permission.dto';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { ApiProperty } from '@nestjs/swagger';

export class GetEnvironmentPermissionsResponseDTO {
  @ApiProperty({ type: [EnvironmentPermissionDTO] })
  environmentPermissions: EnvironmentPermissionDTO[];

  static fromDomains(
    environmentPermissions: EnvironmentPermission[],
  ): GetEnvironmentPermissionsResponseDTO {
    const dto = new GetEnvironmentPermissionsResponseDTO();
    dto.environmentPermissions = environmentPermissions.map(
      EnvironmentPermissionDTO.fromDomain,
    );
    return dto;
  }
}
