import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';

export class GithubCollaboratorsMapper {
  static dtoToDomains(
    githubCollaboratorsDTO: RestEndpointMethodTypes['repos']['listCollaborators']['response']['data'],
  ): VcsUser[] {
    return githubCollaboratorsDTO.map(GithubCollaboratorsMapper.dtoToDomain);
  }

  static dtoToDomain(
    githubCollaboratorDTO: RestEndpointMethodTypes['repos']['listCollaborators']['response']['data'][0],
  ): VcsUser {
    return new VcsUser(
      githubCollaboratorDTO.id,
      githubCollaboratorDTO.login,
      githubCollaboratorDTO.avatar_url,
      GithubCollaboratorsMapper.mapGithubRoleToDomain(
        githubCollaboratorDTO.role_name,
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
