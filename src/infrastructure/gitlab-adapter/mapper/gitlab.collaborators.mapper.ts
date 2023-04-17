import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { GitlabCollaboratorDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.collaborator.dto';

export class GitlabCollaboratorsMapper {
  static dtoToDomains(
    gitlabCollaboratorsDTO: GitlabCollaboratorDTO[],
  ): VcsUser[] {
    return gitlabCollaboratorsDTO.map(GitlabCollaboratorsMapper.dtoToDomain);
  }

  static dtoToDomain(gitlabCollaboratorDTO: GitlabCollaboratorDTO): VcsUser {
    return new VcsUser(
      gitlabCollaboratorDTO.id,
      gitlabCollaboratorDTO.username,
      gitlabCollaboratorDTO.avatarUrl,
      GitlabCollaboratorsMapper.mapGitlabRoleToDomain(
        gitlabCollaboratorDTO.accessLevel,
      ),
    );
  }

  private static mapGitlabRoleToDomain(
    gitlabAccessLevel: number,
  ): VcsRepositoryRole {
    switch (gitlabAccessLevel) {
      case 50:
        return VcsRepositoryRole.ADMIN;
      case 40:
        return VcsRepositoryRole.MAINTAIN;
      case 30:
        return VcsRepositoryRole.WRITE;
      case 20:
        return VcsRepositoryRole.TRIAGE;
      case 10:
        return VcsRepositoryRole.READ;
      default:
        return VcsRepositoryRole.READ;
    }
  }
}
