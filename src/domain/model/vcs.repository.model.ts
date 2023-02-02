import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

export class VcsRepository {
  id: number;
  name: string;
  organization: string;
  pushedAt: string;
  vcsType: VCSProvider;
  vcsUrl: string;

  constructor(
    id: number,
    name: string,
    organization: string,
    pushedAt: string,
    vcsType: VCSProvider,
    vcsUrl: string,
  ) {
    this.id = id;
    this.name = name;
    this.organization = organization;
    this.pushedAt = pushedAt;
    this.vcsType = vcsType;
    this.vcsUrl = vcsUrl;
  }
}
