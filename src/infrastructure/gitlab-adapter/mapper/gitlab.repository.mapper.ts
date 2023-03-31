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
        name: gitlabRepositoryDTO.namespace.name,
        id: gitlabRepositoryDTO.namespace.id,
        avatarUrl: gitlabRepositoryDTO.namespace.avatar_url,
      },
      gitlabRepositoryDTO.created_at
        ? new Date(gitlabRepositoryDTO.created_at)
        : undefined,
      VCSProvider.Gitlab,
      gitlabRepositoryDTO.web_url,
      gitlabRepositoryDTO.permissions
        ? GitlabRepositoryMapper.isCurrentUserRepositoryAdmin(
            gitlabRepositoryDTO.permissions,
          )
        : false,
      gitlabRepositoryDTO.default_branch,
    );
  }

  private static isCurrentUserRepositoryAdmin(
    permissions: GitlabPermissionsDTO,
  ) {
    if (!!permissions.project_access && !!permissions.group_access) {
      return (
        permissions.project_access.access_level === 50 ||
        permissions.group_access.access_level === 50
      );
    }

    if (!!permissions.project_access) {
      return permissions.project_access.access_level === 50;
    }

    if (!!permissions.group_access) {
      return permissions.group_access.access_level === 50;
    }

    return false;
  }
}
