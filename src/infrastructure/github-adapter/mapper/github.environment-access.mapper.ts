import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { EnvironmentAccess } from 'src/domain/model/environment-access/environment-access.model';
import { EnvironmentAccessRole } from 'src/domain/model/environment-access/environment-access-role.enum';
import { v4 as uuid } from 'uuid';

export class GithubRightMapper {
  static dtoToDomains(
    githubRightDTOs: RestEndpointMethodTypes['repos']['listCollaborators']['response']['data'],
  ): EnvironmentAccess[] {
    return githubRightDTOs.map(GithubRightMapper.dtoToDomain);
  }

  static dtoToDomain(
    githubRightDTO: RestEndpointMethodTypes['repos']['listCollaborators']['response']['data'][0],
  ): EnvironmentAccess {
    return new EnvironmentAccess(
      uuid(),
      {
        name: githubRightDTO.login,
        vcsId: githubRightDTO.id,
        avatarUrl: githubRightDTO.avatar_url,
      },
      GithubRightMapper.mapGithubRightToSymeoRight(githubRightDTO.role_name),
    );
  }

  private static mapGithubRightToSymeoRight(role_name: string) {
    switch (role_name) {
      case 'admin':
        return EnvironmentAccessRole.ADMIN;
      case 'maintain':
      case 'write':
      case 'triage':
      case 'read':
        return EnvironmentAccessRole.READ_NON_SECRET;
      default:
        return EnvironmentAccessRole.READ_NON_SECRET;
    }
  }
}
