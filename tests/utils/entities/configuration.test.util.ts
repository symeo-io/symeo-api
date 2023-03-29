import { AppClient } from 'tests/utils/app.client';
import { Repository } from 'typeorm';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';

export class ConfigurationTestUtil {
  public repository: Repository<ConfigurationEntity>;
  constructor(appClient: AppClient) {
    this.repository = appClient.module.get<Repository<ConfigurationEntity>>(
      getRepositoryToken(ConfigurationEntity),
    );
  }

  public async createConfiguration(
    vcsProvider: VCSProvider,
    repositoryVcsId?: number,
  ): Promise<ConfigurationEntity> {
    const configuration = new ConfigurationEntity();
    configuration.id = uuid();
    configuration.name = faker.lorem.slug();
    configuration.vcsType = vcsProvider;
    configuration.repositoryVcsId = repositoryVcsId ?? faker.datatype.number();
    configuration.repositoryVcsName = faker.lorem.slug();
    configuration.ownerVcsId = faker.datatype.number();
    configuration.ownerVcsName = faker.lorem.slug();
    configuration.contractFilePath = faker.lorem.slug();
    configuration.branch = faker.lorem.slug();

    await this.repository.save(configuration);

    return configuration;
  }
  public empty() {
    return this.repository.delete({});
  }
}
