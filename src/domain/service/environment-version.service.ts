import EnvironmentVersionFacade from 'src/domain/port/in/environment-version.facade';
import { SecretValuesStoragePort } from 'src/domain/port/out/secret-values.storage.port';
import Environment from 'src/domain/model/environment/environment.model';
import { EnvironmentVersion } from 'src/domain/model/environment-version/environment-version.model';

export class EnvironmentVersionService implements EnvironmentVersionFacade {
  constructor(
    private readonly secretValuesStoragePort: SecretValuesStoragePort,
  ) {}
  async getEnvironmentVersions(
    environment: Environment,
  ): Promise<EnvironmentVersion[]> {
    const environmentVersions: EnvironmentVersion[] =
      await this.secretValuesStoragePort.getVersionsForEnvironment(environment);
    return environmentVersions;
  }
}
