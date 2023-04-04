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
        avatarUrl: gitlabRepositoryDTO.namespace.avatarUrl,
      },
      gitlabRepositoryDTO.createdAt
        ? new Date(gitlabRepositoryDTO.createdAt)
        : undefined,
      VCSProvider.Gitlab,
      gitlabRepositoryDTO.webUrl,
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
    if (!!permissions.projectAccess && !!permissions.groupAccess) {
      return (
        permissions.projectAccess.accessLevel === 50 ||
        permissions.groupAccess.accessLevel === 50
      );
    }

    if (!!permissions.projectAccess) {
      return permissions.projectAccess.accessLevel === 50;
    }

    if (!!permissions.groupAccess) {
      return permissions.groupAccess.accessLevel === 50;
    }

    return false;
  }
}
