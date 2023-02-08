import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import Environment from 'src/domain/model/environment/environment.model';

export default class Configuration {
  id: string;
  name: string;
  vcsType: VCSProvider;
  repository: { name: string; vcsId: number };
  owner: { name: string; vcsId: number };
  configFormatFilePath: string;
  branch: string;
  environments: Environment[];

  constructor(
    id: string,
    name: string,
    vcsType: VCSProvider,
    repository: { name: string; vcsId: number },
    owner: { name: string; vcsId: number },
    configFormatFilePath: string,
    branch: string,
    environments: Environment[],
  ) {
    this.id = id;
    this.name = name;
    this.vcsType = vcsType;
    this.repository = repository;
    this.owner = owner;
    this.configFormatFilePath = configFormatFilePath;
    this.branch = branch;
    this.environments = environments ?? [];
  }
}
