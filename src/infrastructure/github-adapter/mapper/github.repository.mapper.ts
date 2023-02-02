import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { VcsRepository } from 'src/domain/model/vcs.repository.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

export class GithubRepositoryMapper {
  static dtosToDomain(
    githubRepositoriesDTO: RestEndpointMethodTypes['repos']['listForOrg']['response']['data'],
  ): VcsRepository[] {
    return githubRepositoriesDTO.map(this.dtoToDomain);
  }

  private static dtoToDomain(
    githubRepositoryDTO: RestEndpointMethodTypes['repos']['listForOrg']['response']['data'][0],
  ): VcsRepository {
    return new VcsRepository(
      githubRepositoryDTO.id,
      githubRepositoryDTO.name,
      githubRepositoryDTO.owner.login,
      githubRepositoryDTO.pushed_at == null
        ? ''
        : githubRepositoryDTO.pushed_at.toString(),
      VCSProvider.GitHub,
      githubRepositoryDTO.html_url,
    );
  }
}
