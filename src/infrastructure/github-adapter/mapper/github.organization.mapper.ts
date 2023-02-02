import { VcsOrganization } from 'src/domain/model/vcs.organization.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

export class GithubOrganizationMapper {
  static dtosToDomain(
    githubRepositoriesForUserDTO: RestEndpointMethodTypes['repos']['listForAuthenticatedUser']['response']['data'],
  ): VcsOrganization[] {
    return githubRepositoriesForUserDTO.map(this.dtoToDomain);
  }

  static dtoToDomain(
    githubRepositoryForUserDTO: RestEndpointMethodTypes['repos']['listForAuthenticatedUser']['response']['data'][0],
  ): VcsOrganization {
    return new VcsOrganization(
      githubRepositoryForUserDTO.owner.id,
      githubRepositoryForUserDTO.owner.login,
      githubRepositoryForUserDTO.owner.avatar_url,
      VCSProvider.GitHub,
    );
  }
}
