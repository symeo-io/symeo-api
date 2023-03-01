import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import Environment from 'src/domain/model/environment/environment.model';

export default class Configuration {
  id: string;
  name: string;
  vcsType: VCSProvider;
  repository: { name: string; vcsId: number };
  owner: { name: string; vcsId: number };
  contractFilePath: string;
  branch: string;
  environments: Environment[];
  isCurrentUserRepositoryAdmin?: boolean;

  constructor(
    id: string,
    name: string,
    vcsType: VCSProvider,
    repository: { name: string; vcsId: number },
    owner: { name: string; vcsId: number },
    contractFilePath: string,
    branch: string,
    environments: Environment[],
    isCurrentUserRepositoryAdmin?: boolean,
  ) {
    this.id = id;
    this.name = name;
    this.vcsType = vcsType;
    this.repository = repository;
    this.owner = owner;
    this.contractFilePath = contractFilePath;
    this.branch = branch;
    this.environments = environments ?? [];
    this.isCurrentUserRepositoryAdmin = isCurrentUserRepositoryAdmin;
  }
}
