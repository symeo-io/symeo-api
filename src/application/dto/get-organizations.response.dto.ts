import { OrganizationDTO } from 'src/application/dto/organization.dto';
import { VcsOrganization } from 'src/domain/model/vcs.organization.model';

export class GetOrganizationsResponseDTO {
  organizations: OrganizationDTO[];

  static fromDomains(
    vcsOrganizations: VcsOrganization[],
  ): GetOrganizationsResponseDTO {
    const dto = new GetOrganizationsResponseDTO();
    dto.organizations = OrganizationDTO.fromDomains(vcsOrganizations);

    return dto;
  }
}
