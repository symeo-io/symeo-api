import { EnvironmentAccessRole } from 'src/domain/model/environment-access/environment-access-role.enum';
import { EnvironmentAccess } from 'src/domain/model/environment-access/environment-access.model';
import { ApiProperty } from '@nestjs/swagger';

export class EnvironmentAccessDTO {
  @ApiProperty()
  id: string;
  @ApiProperty()
  userVcsId: number;
  @ApiProperty({ enum: EnvironmentAccessRole })
  environmentAccessRole: EnvironmentAccessRole;

  constructor(id: string, userVcsId: number, right: EnvironmentAccessRole) {
    this.id = id;
    this.userVcsId = userVcsId;
    this.environmentAccessRole = right;
  }

  static fromDomain(
    environmentAccess: EnvironmentAccess,
  ): EnvironmentAccessDTO {
    return new EnvironmentAccessDTO(
      environmentAccess.id,
      environmentAccess.userVcsId,
      environmentAccess.environmentAccessRole,
    );
  }
}
