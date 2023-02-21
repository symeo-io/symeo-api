import { EnvironmentAccessRole } from 'src/domain/model/environment-access/environment-access-role.enum';
import { EnvironmentAccess } from 'src/domain/model/environment-access/environment-access.model';
import { ApiProperty } from '@nestjs/swagger';

export class EnvironmentAccessDTO {
  @ApiProperty({
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      vcsId: {
        type: 'number',
        example: 123456789,
      },
      avatarUrl: {
        type: 'string',
      },
    },
  })
  user: { vcsId: number; name: string; avatarUrl: string };
  @ApiProperty({ enum: EnvironmentAccessRole })
  environmentAccessRole: EnvironmentAccessRole;

  constructor(
    user: { vcsId: number; name: string; avatarUrl: string },
    right: EnvironmentAccessRole,
  ) {
    this.user = user;
    this.environmentAccessRole = right;
  }

  static fromDomain(right: EnvironmentAccess): EnvironmentAccessDTO {
    return new EnvironmentAccessDTO(right.user, right.environmentAccessRole);
  }
}
