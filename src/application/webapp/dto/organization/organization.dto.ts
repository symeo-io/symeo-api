import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { ApiProperty } from '@nestjs/swagger';
import { LicenceDTO } from './licence.dto';
import { PlanEnum } from '../../../../domain/model/licence/plan.enum';

export class OrganizationDTO {
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
    vcsId: number,
    name: string,
    displayName: string,
    avatarUrl: string,
    settings: LicenceDTO,
  ) {
    this.vcsId = vcsId;
    this.name = name;
    this.displayName = displayName;
    this.avatarUrl = avatarUrl;
    this.settings = settings;
  }

  public static fromDomain(vcsOrganization: VcsOrganization): OrganizationDTO {
    return new OrganizationDTO(
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
