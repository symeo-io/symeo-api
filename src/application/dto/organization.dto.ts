import { VcsOrganization } from '../../domain/model/vcs.organization.model';

export class OrganizationDTO {
  id: number;
  login: string;

  constructor(id: number, login: string) {
    this.id = id;
    this.login = login;
  }

  public static fromDomainToContract(
    vcsOrganizations: VcsOrganization[],
  ): OrganizationDTO[] {
    const organizationDTOS: OrganizationDTO[] = [];
    vcsOrganizations.forEach((vcsOrganization) =>
      organizationDTOS.push(
        new OrganizationDTO(vcsOrganization.id, vcsOrganization.login),
      ),
    );
    return organizationDTOS;
  }
}
