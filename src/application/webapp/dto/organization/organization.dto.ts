import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationDTO {
  @ApiProperty()
  vcsId: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  displayName: string;
  @ApiProperty()
  avatarUrl: string;

  constructor(
    vcsId: number,
    name: string,
    displayName: string,
    avatarUrl: string,
  ) {
    this.vcsId = vcsId;
    this.name = name;
    this.displayName = displayName;
    this.avatarUrl = avatarUrl;
  }

  public static fromDomain(vcsOrganization: VcsOrganization): OrganizationDTO {
    return new OrganizationDTO(
      vcsOrganization.vcsId,
      vcsOrganization.name,
      vcsOrganization.displayName,
      vcsOrganization.avatarUrl,
    );
  }

  public static fromDomains(
    vcsOrganizations: VcsOrganization[],
  ): OrganizationDTO[] {
    return vcsOrganizations.map(OrganizationDTO.fromDomain);
  }
}
