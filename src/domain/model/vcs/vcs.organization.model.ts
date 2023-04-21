import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import License from '../license/license.model';

export class VcsOrganization {
  vcsId: number;
  name: string;
  displayName: string;
  avatarUrl: string;
  vcsType: VCSProvider;
  license?: License;

  constructor(
    vcsId: number,
    name: string,
    displayName: string,
    avatarUrl: string,
    vcsType: VCSProvider,
    license?: License,
  ) {
    this.vcsId = vcsId;
    this.name = name;
    this.displayName = displayName;
    this.avatarUrl = avatarUrl;
    this.vcsType = vcsType;
    this.license = license;
  }
}
