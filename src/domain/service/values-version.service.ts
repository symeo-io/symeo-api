import ValuesVersionFacade from 'src/domain/port/in/values-version.facade';
import { SecretValuesStoragePort } from 'src/domain/port/out/secret-values.storage.port';
import Environment from 'src/domain/model/environment/environment.model';
import { ValuesVersion } from 'src/domain/model/values-version/values-version.model';

export class ValuesVersionService implements ValuesVersionFacade {
  constructor(
    private readonly secretValuesStoragePort: SecretValuesStoragePort,
  ) {}
  async getValuesVersions(environment: Environment): Promise<ValuesVersion[]> {
    const valuesVersions: ValuesVersion[] =
      await this.secretValuesStoragePort.getVersionsForEnvironment(environment);
    return valuesVersions.sort(
      (version1, version2) =>
        new Date(version2.creationDate).getTime() -
        new Date(version1.creationDate).getTime(),
    );
  }
}
