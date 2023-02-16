import Configuration from 'src/domain/model/configuration/configuration.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import EnvironmentDTO from 'src/application/webapp/dto/environment/environment.dto';

export default class ConfigurationDTO {
  id: string;
  name: string;
  vcsType: VCSProvider;
  repository: { name: string; vcsId: number };
  owner: { name: string; vcsId: number };
  contractFilePath: string;
  branch: string;
  environments: EnvironmentDTO[];

  constructor(
    id: string,
    name: string,
    vcsType: VCSProvider,
    repository: { name: string; vcsId: number },
    owner: { name: string; vcsId: number },
    contractFilePath: string,
    branch: string,
    environments: EnvironmentDTO[],
  ) {
    this.id = id;
    this.name = name;
    this.vcsType = vcsType;
    this.repository = repository;
    this.owner = owner;
    this.contractFilePath = contractFilePath;
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
      configuration.contractFilePath,
      configuration.branch,
      configuration.environments.map(EnvironmentDTO.fromDomain),
    );
  }
}
