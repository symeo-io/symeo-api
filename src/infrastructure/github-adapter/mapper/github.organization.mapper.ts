import { VcsOrganization } from 'src/domain/model/vcs.organization.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

export class GithubOrganizationMapper {
  static dtoToDomain(
    githubOrganizationDTOS: RestEndpointMethodTypes['orgs']['listForAuthenticatedUser']['response']['data'],
  ): VcsOrganization[] {
    const vcsOrganizationArray: VcsOrganization[] = [];
    githubOrganizationDTOS.forEach((githubOrganizationDTO) =>
      vcsOrganizationArray.push(
        new VcsOrganization(
          githubOrganizationDTO.id,
          githubOrganizationDTO.login,
          githubOrganizationDTO.avatar_url,
          VCSProvider.GitHub,
        ),
      ),
    );
    return vcsOrganizationArray;
  }
}
