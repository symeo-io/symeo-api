import { OrganizationDTO } from 'src/application/webapp/dto/organization/organization.dto';
import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { ApiProperty } from '@nestjs/swagger';

export class GetOrganizationsResponseDTO {
  @ApiProperty({ type: OrganizationDTO })
  organizations: OrganizationDTO[];

  static fromDomains(
    vcsOrganizations: VcsOrganization[],
  ): GetOrganizationsResponseDTO {
    const dto = new GetOrganizationsResponseDTO();
    dto.organizations = OrganizationDTO.fromDomains(vcsOrganizations);

    return dto;
  }
}
