import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { VcsBranch } from 'src/domain/model/vcs/vcs.branch.model';
import { ApiProperty } from '@nestjs/swagger';

export class VcsBranchDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  commitSha: string;

  @ApiProperty()
  vcsType: VCSProvider;

  constructor(name: string, commitSha: string, vcsType: VCSProvider) {
    this.name = name;
    this.commitSha = commitSha;
    this.vcsType = vcsType;
  }

  public static fromDomains(branches: VcsBranch[]): VcsBranchDTO[] {
    return branches.map(VcsBranchDTO.fromDomain);
  }

  public static fromDomain(branch: VcsBranch): VcsBranchDTO {
    return new VcsBranchDTO(branch.name, branch.commitSha, branch.vcsType);
  }
}
