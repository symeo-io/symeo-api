import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { VcsBranch } from 'src/domain/model/vcs/vcs.branch.model';

export class GithubBranchMapper {
  static dtoToDomains(
    githubBranchDTOs: RestEndpointMethodTypes['repos']['listBranches']['response']['data'],
  ): VcsBranch[] {
    return githubBranchDTOs.map(this.dtoToDomain);
  }

  public static dtoToDomain(
    githubBranchDTO: RestEndpointMethodTypes['repos']['listBranches']['response']['data'][0],
  ): VcsBranch {
    return new VcsBranch(
      githubBranchDTO.name,
      githubBranchDTO.commit.sha,
      VCSProvider.GitHub,
    );
  }
}
