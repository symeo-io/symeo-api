import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { Right } from 'src/domain/model/right/right.model';
import { EnvironmentAccessRole } from 'src/domain/model/right/environment-access-role.enum';

export class GithubRightMapper {
  static dtoToDomains(
    githubRightDTOs: RestEndpointMethodTypes['repos']['listCollaborators']['response']['data'],
  ): Right[] {
    return githubRightDTOs.map(GithubRightMapper.dtoToDomain);
  }

  static dtoToDomain(
    githubRightDTO: RestEndpointMethodTypes['repos']['listCollaborators']['response']['data'][0],
  ): Right {
    return new Right(
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
