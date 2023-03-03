import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { GithubCollaboratorDTO } from 'src/infrastructure/github-adapter/dto/github.collaborator.dto';

export class GithubCollaboratorsMapper {
  static dtoToDomains(
    githubCollaboratorsDTO: GithubCollaboratorDTO[],
  ): VcsUser[] {
    return githubCollaboratorsDTO.map(GithubCollaboratorsMapper.dtoToDomain);
  }

  static dtoToDomain(githubCollaboratorDTO: GithubCollaboratorDTO): VcsUser {
    return new VcsUser(
      githubCollaboratorDTO.id,
      githubCollaboratorDTO.login,
      githubCollaboratorDTO.avatarUrl,
      GithubCollaboratorsMapper.mapGithubRoleToDomain(
        githubCollaboratorDTO.roleName,
      ),
    );
  }

  private static mapGithubRoleToDomain(
    githubRoleName: string,
  ): VcsRepositoryRole {
    switch (githubRoleName) {
      case 'admin':
        return VcsRepositoryRole.ADMIN;
      case 'maintain':
        return VcsRepositoryRole.MAINTAIN;
      case 'write':
        return VcsRepositoryRole.WRITE;
      case 'triage':
        return VcsRepositoryRole.TRIAGE;
      case 'read':
        return VcsRepositoryRole.READ;
      default:
        return VcsRepositoryRole.READ;
    }
  }
}
