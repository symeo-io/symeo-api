import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import Configuration from 'src/domain/model/configuration/configuration.model';

export class VcsRepository {
  id: number;
  name: string;
  owner: { name: string; id: number; avatarUrl: string };
  pushedAt?: Date;
  vcsType: VCSProvider;
  vcsUrl: string;
  configurations?: Configuration[];
  isCurrentUserAdmin: boolean;

  constructor(
    id: number,
    name: string,
    owner: { name: string; id: number; avatarUrl: string },
    pushedAt: Date | undefined,
    vcsType: VCSProvider,
    vcsUrl: string,
    isCurrentUserRepositoryAdmin: boolean,
  ) {
    this.id = id;
    this.name = name;
    this.owner = owner;
    this.pushedAt = pushedAt;
    this.vcsType = vcsType;
    this.vcsUrl = vcsUrl;
    this.isCurrentUserAdmin = isCurrentUserRepositoryAdmin;
  }
}
