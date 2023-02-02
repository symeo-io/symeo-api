import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { VcsRepository } from 'src/domain/model/vcs.repository.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

export class GithubRepositoryMapper {
  static dtoToDomain(
    organizationName: string,
    githubRepositoriesDTO: RestEndpointMethodTypes['repos']['listForOrg']['response']['data'],
  ): VcsRepository[] {
    const repositoryArray: VcsRepository[] = [];
    githubRepositoriesDTO.forEach((githubRepositoryDTO) => {
      repositoryArray.push(
        new VcsRepository(
          githubRepositoryDTO.id,
          githubRepositoryDTO.name,
          organizationName,
          githubRepositoryDTO.pushed_at == null
            ? ''
            : githubRepositoryDTO.pushed_at.toString(),
          VCSProvider.GitHub,
          githubRepositoryDTO.html_url,
        ),
      );
    });
    return repositoryArray;
  }
}
