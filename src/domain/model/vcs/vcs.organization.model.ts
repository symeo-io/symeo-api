import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import Licence from '../licence/licence.model';

export class VcsOrganization {
  vcsId: number;
  name: string;
  displayName: string;
  avatarUrl: string;
  vcsType: VCSProvider;
  licence?: Licence;

  constructor(
    vcsId: number,
    name: string,
    displayName: string,
    avatarUrl: string,
    vcsType: VCSProvider,
    licence?: Licence,
  ) {
    this.vcsId = vcsId;
    this.name = name;
    this.displayName = displayName;
    this.avatarUrl = avatarUrl;
    this.vcsType = vcsType;
    this.licence = licence;
  }
}
