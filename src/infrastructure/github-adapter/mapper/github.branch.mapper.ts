import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { VcsBranch } from 'src/domain/model/vcs/vcs.branch.model';
import { GithubBranchDTO } from 'src/infrastructure/github-adapter/dto/github.branch.dto';

export class GithubBranchMapper {
  static dtoToDomains(githubBranchDTOs: GithubBranchDTO[]): VcsBranch[] {
    return githubBranchDTOs.map(this.dtoToDomain);
  }

  public static dtoToDomain(githubBranchDTO: GithubBranchDTO): VcsBranch {
    return new VcsBranch(
      githubBranchDTO.name,
      githubBranchDTO.commit.sha,
      VCSProvider.GitHub,
    );
  }
}
