import { EnvironmentAccessDTO } from 'src/application/webapp/dto/environment-access/environment-access.dto';
import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentAccess } from 'src/domain/model/environment-access/environment-access.model';

export class UpdateEnvironmentAccessesDTO {
  @ApiProperty({ type: [EnvironmentAccessDTO] })
  environmentAccessDTOS: EnvironmentAccessDTO[];

  toDomain(): EnvironmentAccess[] {
    return this.environmentAccessDTOS.map((environmentAccessDTO) => {
      return new EnvironmentAccess(
        environmentAccessDTO.id,
        environmentAccessDTO.userVcsId,
        environmentAccessDTO.environmentAccessRole,
      );
    });
  }
}
