import { VcsBranch } from 'src/domain/model/vcs/vcs.branch.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { GitlabBranchDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.branch.dto';

export class GitlabBranchMapper {
  static dtoToDomains(gitlabBranchDTOs: GitlabBranchDTO[]): VcsBranch[] {
    return gitlabBranchDTOs.map(this.dtoToDomain);
  }

  public static dtoToDomain(gitlabBranchDTO: GitlabBranchDTO): VcsBranch {
    return new VcsBranch(
      gitlabBranchDTO.name,
      gitlabBranchDTO.commit.sha,
      VCSProvider.Gitlab,
    );
  }
}
