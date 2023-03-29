import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { GitlabRepositoryDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.repository.dto';
import { GitlabPermissionsDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.permissions.dto';

export class GitlabRepositoryMapper {
  static dtoToDomains(
    gitlabRepositoryDTOs: GitlabRepositoryDTO[],
  ): VcsRepository[] {
    return gitlabRepositoryDTOs.map(this.dtoToDomain);
  }

  public static dtoToDomain(
    gitlabRepositoryDTO: GitlabRepositoryDTO,
  ): VcsRepository {
    return new VcsRepository(
      gitlabRepositoryDTO.id,
      gitlabRepositoryDTO.name,
      {
        name: gitlabRepositoryDTO.owner.login,
        id: gitlabRepositoryDTO.owner.id,
        avatarUrl: gitlabRepositoryDTO.owner.avatarUrl,
      },
      gitlabRepositoryDTO.pushedAt
        ? new Date(gitlabRepositoryDTO.pushedAt)
        : undefined,
      VCSProvider.Gitlab,
      gitlabRepositoryDTO.htmlUrl,
      gitlabRepositoryDTO.permissions
        ? GitlabRepositoryMapper.isCurrentUserRepositoryAdmin(
            gitlabRepositoryDTO.permissions,
          )
        : false,
      gitlabRepositoryDTO.defaultBranch,
    );
  }

  private static isCurrentUserRepositoryAdmin(
    permissions: GitlabPermissionsDTO,
  ) {
    if (!!permissions.project_access) {
      return permissions.project_access.access_level === 50;
    }

    if (!!permissions.group_access) {
      return permissions.group_access.access_level === 50;
    }

    return false;
  }
}
