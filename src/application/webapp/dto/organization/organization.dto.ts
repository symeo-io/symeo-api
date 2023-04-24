import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { ApiProperty } from '@nestjs/swagger';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';

export class OrganizationDTO {
  @ApiProperty()
  vcsType: VCSProvider;
  @ApiProperty()
  vcsId: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  displayName: string;
  @ApiProperty()
  avatarUrl: string;

  constructor(
    vcsType: VCSProvider,
    vcsId: number,
    name: string,
    displayName: string,
    avatarUrl: string,
  ) {
    this.vcsType = vcsType;
    this.vcsId = vcsId;
    this.name = name;
    this.displayName = displayName;
    this.avatarUrl = avatarUrl;
  }

  public static fromDomain(vcsOrganization: VcsOrganization): OrganizationDTO {
    return new OrganizationDTO(
      vcsOrganization.vcsType,
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
