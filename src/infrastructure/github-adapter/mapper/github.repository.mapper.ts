import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { GithubRepositoryDTO } from 'src/infrastructure/github-adapter/dto/github.repository.dto';

export class GithubRepositoryMapper {
  static dtoToDomains(
    githubRepositoryDTOs: GithubRepositoryDTO[],
  ): VcsRepository[] {
    return githubRepositoryDTOs.map(this.dtoToDomain);
  }

  public static dtoToDomain(
    githubRepositoryDTO: GithubRepositoryDTO,
  ): VcsRepository {
    return new VcsRepository(
      githubRepositoryDTO.id,
      githubRepositoryDTO.name,
      {
        name: githubRepositoryDTO.owner.login,
        id: githubRepositoryDTO.owner.id,
        avatarUrl: githubRepositoryDTO.owner.avatarUrl,
      },
      githubRepositoryDTO.pushedAt
        ? new Date(githubRepositoryDTO.pushedAt)
        : undefined,
      VCSProvider.GitHub,
      githubRepositoryDTO.htmlUrl,
      githubRepositoryDTO.permissions
        ? githubRepositoryDTO.permissions.admin
        : false,
    );
  }
}
