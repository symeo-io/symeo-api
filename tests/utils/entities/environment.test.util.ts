import { AppClient } from 'tests/utils/app.client';
import { Repository } from 'typeorm';
import EnvironmentEntity from 'src/infrastructure/postgres-adapter/entity/environment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { faker } from '@faker-js/faker';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';

export class EnvironmentTestUtil {
  public repository: Repository<EnvironmentEntity>;
  constructor(appClient: AppClient) {
    this.repository = appClient.module.get<Repository<EnvironmentEntity>>(
      getRepositoryToken(EnvironmentEntity),
    );
  }

  public async createEnvironment(
    configuration: ConfigurationEntity,
  ): Promise<EnvironmentEntity> {
    const environment = new EnvironmentEntity();
    environment.id = uuid();
    environment.name = faker.datatype.string();
    environment.color = 'blue';
    environment.configuration = configuration;

    await this.repository.save(environment);

    return environment;
  }
  public empty() {
    return this.repository.delete({});
  }
}
