import Configuration from 'src/domain/model/configuration/configuration.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

export default class ConfigurationDTO {
  id: string;
  name: string;
  vcsType: VCSProvider;
  repository: { name: string; vcsId: number };
  owner: { name: string; vcsId: number };
  configFormatFilePath: string;
  branch: string;
  environments: { id: string; name: string }[];

  constructor(
    id: string,
    name: string,
    vcsType: VCSProvider,
    repository: { name: string; vcsId: number },
    owner: { name: string; vcsId: number },
    configFormatFilePath: string,
    branch: string,
    environments: { id: string; name: string }[],
  ) {
    this.id = id;
    this.name = name;
    this.vcsType = vcsType;
    this.repository = repository;
    this.owner = owner;
    this.configFormatFilePath = configFormatFilePath;
    this.branch = branch;
    this.environments = environments;
  }

  public static fromDomain(configuration: Configuration): ConfigurationDTO {
    return new ConfigurationDTO(
      configuration.id,
      configuration.name,
      configuration.vcsType,
      configuration.repository,
      configuration.owner,
      configuration.configFormatFilePath,
      configuration.branch,
      configuration.environments,
    );
  }
}
