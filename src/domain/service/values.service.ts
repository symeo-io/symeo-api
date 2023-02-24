import { ValuesFacade } from 'src/domain/port/in/values.facade';
import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { SecretValuesStoragePort } from 'src/domain/port/out/secret-values.storage.port';
import Environment from 'src/domain/model/environment/environment.model';

export class ValuesService implements ValuesFacade {
  constructor(
    private readonly configurationFacade: ConfigurationFacade,
    private readonly secretValuesStoragePort: SecretValuesStoragePort,
  ) {}

  async findByEnvironmentId(
    environmentId: string,
  ): Promise<ConfigurationValues> {
    return await this.secretValuesStoragePort.getValuesForEnvironmentId(
      environmentId,
    );
  }

  async updateByEnvironment(
    environment: Environment,
    values: ConfigurationValues,
  ): Promise<void> {
    return await this.secretValuesStoragePort.setValuesForEnvironment(
      environment,
      values,
    );
  }
}
