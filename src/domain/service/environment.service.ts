import { EnvironmentFacade } from 'src/domain/port/in/environment.facade.port';
import { EnvironmentColor } from 'src/domain/model/environment/environment-color.model';
import Environment from 'src/domain/model/environment/environment.model';
import { v4 as uuid } from 'uuid';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import EnvironmentStoragePort from 'src/domain/port/out/environment.storage.port';
import Configuration from 'src/domain/model/configuration/configuration.model';
import { SecretValuesStoragePort } from 'src/domain/port/out/secret-values.storage.port';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';
import User from 'src/domain/model/user/user.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import EnvironmentAuditFacade from 'src/domain/port/in/environment-audit.facade.port';

export class EnvironmentService implements EnvironmentFacade {
  constructor(
    private readonly configurationStoragePort: ConfigurationStoragePort,
    private readonly environmentStoragePort: EnvironmentStoragePort,
    private readonly secretValuesStoragePort: SecretValuesStoragePort,
    private readonly environmentAuditFacade: EnvironmentAuditFacade,
  ) {}

  async createEnvironment(
    currentUser: User,
    repository: VcsRepository,
    configuration: Configuration,
    environmentName: string,
    environmentColor: EnvironmentColor,
  ): Promise<Environment> {
    const environment: Environment = new Environment(
      uuid(),
      environmentName,
      environmentColor,
    );
    configuration.environments.push(environment);
    await this.configurationStoragePort.save(configuration);

    await this.environmentAuditFacade.saveWithEnvironmentMetadataType(
      EnvironmentAuditEventType.CREATED,
      currentUser,
      repository,
      environment,
      {
        name: environmentName,
        color: environmentColor,
      },
    );

    return environment;
  }

  async updateEnvironment(
    currentUser: User,
    repository: VcsRepository,
    environment: Environment,
    name: string,
    environmentColor: EnvironmentColor,
  ): Promise<Environment> {
    environment.name = name;
    environment.color = environmentColor;

    await this.environmentStoragePort.save(environment);

    await this.environmentAuditFacade.saveWithEnvironmentMetadataType(
      EnvironmentAuditEventType.UPDATED,
      currentUser,
      repository,
      environment,
      {
        name: name,
        color: environmentColor,
      },
    );

    return environment;
  }

  async deleteEnvironment(
    currentUser: User,
    repository: VcsRepository,
    environment: Environment,
  ): Promise<void> {
    await this.secretValuesStoragePort.deleteValuesForEnvironment(environment);
    await this.environmentStoragePort.delete(environment);
    await this.environmentAuditFacade.saveWithEnvironmentMetadataType(
      EnvironmentAuditEventType.DELETED,
      currentUser,
      repository,
      environment,
      {
        name: environment.name,
      },
    );
  }
}
