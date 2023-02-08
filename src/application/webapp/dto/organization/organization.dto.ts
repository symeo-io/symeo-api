import { VcsOrganization } from 'src/domain/model/vcs.organization.model';

export class OrganizationDTO {
  vcsId: number;
  name: string;
  avatarUrl: string;

  constructor(vcsId: number, name: string, avatarUrl: string) {
    this.vcsId = vcsId;
    this.name = name;
    this.avatarUrl = avatarUrl;
  }

  public static fromDomain(vcsOrganization: VcsOrganization): OrganizationDTO {
    return new OrganizationDTO(
      vcsOrganization.vcsId,
      vcsOrganization.name,
      vcsOrganization.avatarUrl,
    );
  }

  public static fromDomains(
    vcsOrganizations: VcsOrganization[],
  ): OrganizationDTO[] {
    return vcsOrganizations.map(OrganizationDTO.fromDomain);
  }
}
