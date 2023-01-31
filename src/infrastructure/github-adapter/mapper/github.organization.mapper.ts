import { VcsOrganization } from '../../../domain/model/vcs.organization.model';
import { GithubOrganizationDTO } from '../dto/github.organization.dto';

export class GithubOrganizationMapper {
  static dtoToDomain(
    githubOrganizationDTOS: GithubOrganizationDTO[],
  ): VcsOrganization[] {
    const vcsOrganizationArray: VcsOrganization[] = [];
    githubOrganizationDTOS.forEach((githubOrganizationDTO) =>
      vcsOrganizationArray.push(
        new VcsOrganization(
          githubOrganizationDTO.id,
          githubOrganizationDTO.login,
        ),
      ),
    );
    return vcsOrganizationArray;
  }
}
