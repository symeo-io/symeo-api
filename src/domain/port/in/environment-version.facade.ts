import Environment from 'src/domain/model/environment/environment.model';
import { EnvironmentVersion } from 'src/domain/model/environment-version/environment-version.model';

export default interface EnvironmentVersionFacade {
  getEnvironmentVersions(
    environment: Environment,
  ): Promise<EnvironmentVersion[]>;
}
