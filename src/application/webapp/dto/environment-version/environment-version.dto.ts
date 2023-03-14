import { EnvironmentVersion } from 'src/domain/model/environment-version/environment-version.model';
import { ApiProperty } from '@nestjs/swagger';

export class EnvironmentVersionDTO {
  @ApiProperty()
  versionId: string;
  @ApiProperty()
  creationDate: Date;

  constructor(versionId: string, creationDate: Date) {
    this.versionId = versionId;
    this.creationDate = creationDate;
  }

  static fromDomain(
    environmentVersion: EnvironmentVersion,
  ): EnvironmentVersionDTO {
    return new EnvironmentVersionDTO(
      environmentVersion.versionId,
      environmentVersion.creationDate,
    );
  }
}
