import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import Configuration from 'src/domain/model/configuration/configuration.model';

export class VcsRepository {
  id: number;
  name: string;
  owner: { name: string; id: number; avatarUrl: string };
  pushedAt?: Date;
  vcsType: VCSProvider;
  vcsUrl: string;
  configurations?: Configuration[];

  constructor(
    id: number,
    name: string,
    owner: { name: string; id: number; avatarUrl: string },
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
