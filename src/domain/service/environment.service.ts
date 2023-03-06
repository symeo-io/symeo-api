import { EnvironmentFacade } from 'src/domain/port/in/environment.facade.port';
import { EnvironmentColor } from 'src/domain/model/environment/environment-color.model';
import Environment from 'src/domain/model/environment/environment.model';
import { v4 as uuid } from 'uuid';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import EnvironmentStoragePort from 'src/domain/port/out/environment.storage.port';
import Configuration from 'src/domain/model/configuration/configuration.model';
import { SecretValuesStoragePort } from 'src/domain/port/out/secret-values.storage.port';

export class EnvironmentService implements EnvironmentFacade {
  constructor(
    private readonly configurationStoragePort: ConfigurationStoragePort,
    private readonly environmentStoragePort: EnvironmentStoragePort,
    private readonly secretValuesStoragePort: SecretValuesStoragePort,
  ) {}

  async createEnvironment(
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
    return environment;
  }

  async deleteEnvironment(environment: Environment): Promise<void> {
    await this.secretValuesStoragePort.deleteValuesForEnvironment(environment);
    await this.environmentStoragePort.delete(environment);
  }

  async updateEnvironment(
    environment: Environment,
    environmentName: string,
    environmentColor: EnvironmentColor,
  ): Promise<Environment> {
    environment.name = environmentName;
    environment.color = environmentColor;

    await this.environmentStoragePort.save(environment);
    return environment;
  }
}
