import Environment from 'src/domain/model/environment/environment.model';
import { ValuesVersion } from 'src/domain/model/values-version/values-version.model';

export default interface ValuesVersionFacade {
  getValuesVersions(environment: Environment): Promise<ValuesVersion[]>;
}
