import { EnvironmentAccess } from 'src/domain/model/environment-access/environment-access.model';
import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentAccessDTO } from 'src/application/webapp/dto/environment-access/environment-access.dto';

export class UpdateEnvironmentAccessesResponseDTO {
  @ApiProperty({ type: [EnvironmentAccessDTO] })
  environmentAccesses: EnvironmentAccessDTO[];

  static fromDomains(environmentAccesses: EnvironmentAccess[]) {
    const dto = new UpdateEnvironmentAccessesResponseDTO();
    dto.environmentAccesses = environmentAccesses.map(
      EnvironmentAccessDTO.fromDomain,
    );
    return dto;
  }
}
