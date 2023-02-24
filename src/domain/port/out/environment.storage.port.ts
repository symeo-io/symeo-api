import Environment from 'src/domain/model/environment/environment.model';

export default interface EnvironmentStoragePort {
  save(environment: Environment): Promise<void>;

  delete(environment: Environment): Promise<void>;
}
