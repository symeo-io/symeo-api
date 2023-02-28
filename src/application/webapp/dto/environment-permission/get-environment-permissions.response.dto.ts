import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentPermissionWithUser } from 'src/domain/model/environment-permission/environment-permission-user.model';
import { EnvironmentPermissionWithUserDTO } from 'src/application/webapp/dto/environment-permission/environment-permission-with-user.dto';

export class GetEnvironmentPermissionsResponseDto {
  @ApiProperty({ type: [EnvironmentPermissionWithUserDTO] })
  permissions: EnvironmentPermissionWithUserDTO[];

  static fromDomains(
    environmentPermissionUsers: EnvironmentPermissionWithUser[],
  ): GetEnvironmentPermissionsResponseDto {
    const dto = new GetEnvironmentPermissionsResponseDto();
    dto.permissions = environmentPermissionUsers.map(
      EnvironmentPermissionWithUserDTO.fromDomain,
    );
    return dto;
  }
}
