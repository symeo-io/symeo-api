import { EnvironmentAccessDTO } from 'src/application/webapp/dto/environment-access/environment-access.dto';
import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationDTO from 'src/application/webapp/dto/configuration/configuration.dto';
import { EnvironmentAccess } from 'src/domain/model/environment-access/environment-access.model';
import { ApiProperty } from '@nestjs/swagger';

export class GetEnvironmentAccessesResponseDTO {
  @ApiProperty({ type: [EnvironmentAccessDTO] })
  environmentAccesses: EnvironmentAccessDTO[];

  static fromDomains(membersRight: EnvironmentAccess[]) {
    const dto = new GetEnvironmentAccessesResponseDTO();
    dto.environmentAccesses = membersRight.map(EnvironmentAccessDTO.fromDomain);
    return dto;
  }
}
