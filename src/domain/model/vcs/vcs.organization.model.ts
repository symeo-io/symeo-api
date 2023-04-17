import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';

export class VcsOrganization {
  vcsId: number;
  name: string;
  displayName: string;
  avatarUrl: string;
  vcsType: VCSProvider;

  constructor(
    vcsId: number,
    name: string,
    displayName: string,
    avatarUrl: string,
    vcsType: VCSProvider,
  ) {
    this.vcsId = vcsId;
    this.name = name;
    this.displayName = displayName;
    this.avatarUrl = avatarUrl;
    this.vcsType = vcsType;
  }
}
