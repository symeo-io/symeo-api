import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

export default class Configuration {
  id: string;
  name: string;
  vcsType: VCSProvider;
  repository: { name: string; vcsId: number };
  owner: { name: string; vcsId: number };
  configFormatFilePath: string;
  branch: string;

  constructor(
    id: string,
    name: string,
    vcsType: VCSProvider,
    repository: { name: string; vcsId: number },
    owner: { name: string; vcsId: number },
    configFormatFilePath: string,
    branch: string,
  ) {
    this.id = id;
    this.name = name;
    this.vcsType = vcsType;
    this.repository = repository;
    this.owner = owner;
    this.configFormatFilePath = configFormatFilePath;
    this.branch = branch;
  }
}
