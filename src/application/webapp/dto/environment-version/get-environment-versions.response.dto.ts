import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentVersion } from 'src/domain/model/environment-version/environment-version.model';
import { EnvironmentVersionDTO } from 'src/application/webapp/dto/environment-version/environment-version.dto';

export class GetEnvironmentVersionsResponseDTO {
  @ApiProperty({ type: [EnvironmentVersionDTO] })
  versions: EnvironmentVersionDTO[];

  static fromDomains(versions: EnvironmentVersion[]) {
    const dto = new GetEnvironmentVersionsResponseDTO();
    dto.versions = versions.map(EnvironmentVersionDTO.fromDomain);
    return dto;
  }
}
