import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { VcsRepository } from 'src/domain/model/vcs.repository.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

export class GithubRepositoryMapper {
  static dtoToDomains(
    githubRepositoryDTOs: RestEndpointMethodTypes['repos']['listForOrg']['response']['data'],
  ): VcsRepository[] {
    return githubRepositoryDTOs.map(this.dtoToDomain);
  }

  public static dtoToDomain(
    githubRepositoryDTO: RestEndpointMethodTypes['repos']['listForOrg']['response']['data'][0],
  ): VcsRepository {
    return new VcsRepository(
      githubRepositoryDTO.id,
      githubRepositoryDTO.name,
      {
        name: githubRepositoryDTO.owner.login,
        id: githubRepositoryDTO.owner.id,
      },
      githubRepositoryDTO.pushed_at
        ? new Date(githubRepositoryDTO.pushed_at)
        : undefined,
      VCSProvider.GitHub,
      githubRepositoryDTO.html_url,
    );
  }
}
