import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

export class VcsOrganization {
  vcsId: number;
  name: string;
  avatarUrl: string;
  vcsType: VCSProvider;

  constructor(
    vcsId: number,
    name: string,
    avatarUrl: string,
    vcsType: VCSProvider,
  ) {
    this.vcsId = vcsId;
    this.name = name;
    this.avatarUrl = avatarUrl;
    this.vcsType = vcsType;
  }
}
