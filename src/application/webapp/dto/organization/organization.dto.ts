import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { ApiProperty } from '@nestjs/swagger';
import { LicenseDTO } from './license.dto';
import { PlanEnum } from '../../../../domain/model/license/plan.enum';

export class OrganizationDTO {
  @ApiProperty()
  vcsId: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  displayName: string;
  @ApiProperty()
  avatarUrl: string;
  @ApiProperty({ type: LicenseDTO })
  settings: LicenseDTO;

  constructor(
    vcsId: number,
    name: string,
    displayName: string,
    avatarUrl: string,
    settings: LicenseDTO,
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
      vcsOrganization.license
        ? LicenseDTO.fromDomain(vcsOrganization.license)
        : new LicenseDTO(PlanEnum.FREE, null),
    );
  }

  public static fromDomains(
    vcsOrganizations: VcsOrganization[],
  ): OrganizationDTO[] {
    return vcsOrganizations.map(OrganizationDTO.fromDomain);
  }
}
