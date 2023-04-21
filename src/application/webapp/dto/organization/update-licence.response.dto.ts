import { ApiProperty } from '@nestjs/swagger';
import Licence from '../../../../domain/model/licence/licence.model';
import { LicenceDTO } from './licence.dto';

export class UpdateLicenceResponseDTO {
  @ApiProperty({ type: LicenceDTO })
  licence: LicenceDTO;

  static fromDomain(licence: Licence) {
    const dto = new UpdateLicenceResponseDTO();
    dto.licence = LicenceDTO.fromDomain(licence);
    return dto;
  }
}
