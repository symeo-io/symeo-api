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
    repositoryVcsId?: number,
  ): Promise<ConfigurationEntity> {
    const configuration = new ConfigurationEntity();
    configuration.id = uuid();
    configuration.name = faker.datatype.string();
    configuration.vcsType = VCSProvider.GitHub;
    configuration.repositoryVcsId = repositoryVcsId ?? faker.datatype.number();
    configuration.repositoryVcsName = faker.datatype.string();
    configuration.ownerVcsId = faker.datatype.number();
    configuration.ownerVcsName = faker.datatype.string();
    configuration.contractFilePath = faker.datatype.string();
    configuration.branch = faker.datatype.string();

    await this.repository.save(configuration);

    return configuration;
  }
  public empty() {
    return this.repository.delete({});
  }
}
