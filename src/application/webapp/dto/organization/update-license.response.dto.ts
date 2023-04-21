import { ApiProperty } from '@nestjs/swagger';
import { LicenseDTO } from './license.dto';
import License from '../../../../domain/model/license/license.model';

export class UpdateLicenseResponseDTO {
  @ApiProperty({ type: LicenseDTO })
  license: LicenseDTO;

  static fromDomain(license: License) {
    const dto = new UpdateLicenseResponseDTO();
    dto.license = LicenseDTO.fromDomain(license);
    return dto;
  }
}
