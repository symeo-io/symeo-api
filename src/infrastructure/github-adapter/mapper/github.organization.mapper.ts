import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
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

  static githubUserDtoToDomain(
    githubUserDTO: RestEndpointMethodTypes['users']['getAuthenticated']['response']['data'],
  ): VcsOrganization {
    return new VcsOrganization(
      githubUserDTO.id,
      githubUserDTO.login,
      githubUserDTO.avatar_url,
      VCSProvider.GitHub,
    );
  }
}
