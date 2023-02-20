import { RightDTO } from 'src/application/webapp/dto/right/right.dto';
import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationDTO from 'src/application/webapp/dto/configuration/configuration.dto';
import { Right } from 'src/domain/model/right/right.model';

export class GetRightsResponseDTO {
  rights: RightDTO[];

  static fromDomains(membersRight: Right[]) {
    const dto = new GetRightsResponseDTO();
    dto.rights = membersRight.map(RightDTO.fromDomain);
    return dto;
  }
}
