import { EnvironmentPermissionUserDTO } from 'src/application/webapp/dto/environment-permission/environment-permission-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentPermissionUser } from 'src/domain/model/environment-permission/environment-permission-user.model';

export class GetEnvironmentPermissionUsersResponseDTO {
  @ApiProperty({ type: [EnvironmentPermissionUserDTO] })
  environmentPermissionUsers: EnvironmentPermissionUserDTO[];

  static fromDomains(
    environmentPermissionUsers: EnvironmentPermissionUser[],
  ): GetEnvironmentPermissionUsersResponseDTO {
    const dto = new GetEnvironmentPermissionUsersResponseDTO();
    dto.environmentPermissionUsers = environmentPermissionUsers.map(
      EnvironmentPermissionUserDTO.fromDomain,
    );
    return dto;
  }
}
