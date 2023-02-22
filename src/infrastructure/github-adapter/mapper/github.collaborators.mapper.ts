import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';

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
      githubCollaboratorDTO.role_name,
    );
  }
}
