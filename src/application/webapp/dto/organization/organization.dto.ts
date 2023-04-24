import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { ApiProperty } from '@nestjs/swagger';
import { LicenceDTO } from './licence.dto';
import { PlanEnum } from '../../../../domain/model/licence/plan.enum';
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
  @ApiProperty({ type: LicenceDTO })
  settings: LicenceDTO;

  constructor(
    vcsType: VCSProvider,
    vcsId: number,
    name: string,
    displayName: string,
    avatarUrl: string,
    settings: LicenceDTO,
  ) {
    this.vcsType = vcsType;
    this.vcsId = vcsId;
    this.name = name;
    this.displayName = displayName;
    this.avatarUrl = avatarUrl;
    this.settings = settings;
  }

  public static fromDomain(vcsOrganization: VcsOrganization): OrganizationDTO {
    return new OrganizationDTO(
      vcsOrganization.vcsType,
      vcsOrganization.vcsId,
      vcsOrganization.name,
      vcsOrganization.displayName,
      vcsOrganization.avatarUrl,
      vcsOrganization.licence
        ? LicenceDTO.fromDomain(vcsOrganization.licence)
        : new LicenceDTO(PlanEnum.FREE, null),
    );
  }

  public static fromDomains(
    vcsOrganizations: VcsOrganization[],
  ): OrganizationDTO[] {
    return vcsOrganizations.map(OrganizationDTO.fromDomain);
  }
}
