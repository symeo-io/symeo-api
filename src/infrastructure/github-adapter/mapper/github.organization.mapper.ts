import { VcsOrganization } from 'src/domain/model/vcs.organization.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

export class GithubOrganizationMapper {
  static dtoToDomains(
    githubOrganizationDTOs: RestEndpointMethodTypes['repos']['listForAuthenticatedUser']['response']['data'][0]['owner'][],
  ): VcsOrganization[] {
    return githubOrganizationDTOs.map(this.dtoToDomain);
  }

  static dtoToDomain(
    githubOrganizationDTO: RestEndpointMethodTypes['repos']['listForAuthenticatedUser']['response']['data'][0]['owner'],
  ): VcsOrganization {
    return new VcsOrganization(
      githubOrganizationDTO.id,
      githubOrganizationDTO.login,
      githubOrganizationDTO.avatar_url,
      VCSProvider.GitHub,
    );
  }
}
