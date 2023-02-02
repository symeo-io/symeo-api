import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

export class VcsRepository {
  id: number;
  name: string;
  owner: { name: string; id: number };
  pushedAt?: Date;
  vcsType: VCSProvider;
  vcsUrl: string;

  constructor(
    id: number,
    name: string,
    owner: { name: string; id: number },
    pushedAt: Date | undefined,
    vcsType: VCSProvider,
    vcsUrl: string,
  ) {
    this.id = id;
    this.name = name;
    this.owner = owner;
    this.pushedAt = pushedAt;
    this.vcsType = vcsType;
    this.vcsUrl = vcsUrl;
  }
}
