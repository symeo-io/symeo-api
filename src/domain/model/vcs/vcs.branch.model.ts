import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';

export class VcsBranch {
  name: string;
  commitSha: string;
  vcsType: VCSProvider;

  constructor(name: string, commitSha: string, vcsType: VCSProvider) {
    this.name = name;
    this.commitSha = commitSha;
    this.vcsType = vcsType;
  }
}
