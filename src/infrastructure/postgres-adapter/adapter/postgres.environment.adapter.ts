import EnvironmentStoragePort from 'src/domain/port/out/environment.storage.port';
import Environment from 'src/domain/model/environment/environment.model';
import EnvironmentEntity from 'src/infrastructure/postgres-adapter/entity/environment.entity';
import { Repository } from 'typeorm';

export default class PostgresEnvironmentAdapter
  implements EnvironmentStoragePort
{
  constructor(private environmentRepository: Repository<EnvironmentEntity>) {}

  async save(environment: Environment): Promise<void> {
    await this.environmentRepository.save(
      EnvironmentEntity.fromDomain(environment),
    );
  }

  async delete(environment: Environment): Promise<void> {
    await this.environmentRepository.delete({ id: environment.id });
  }
}
