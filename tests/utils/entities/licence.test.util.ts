import { Repository } from 'typeorm';
import LicenceEntity from '../../../src/infrastructure/postgres-adapter/entity/licence/licence.entity';
import { AppClient } from '../app.client';
import { getRepositoryToken } from '@nestjs/typeorm';
import Licence from '../../../src/domain/model/licence/licence.model';
import { v4 as uuid } from 'uuid';

export class LicenceTestUtil {
  public repository: Repository<LicenceEntity>;
  constructor(private appClient: AppClient) {
    this.repository = appClient.module.get<Repository<LicenceEntity>>(
      getRepositoryToken(LicenceEntity),
    );
  }

  public async createLicence(licence: Licence): Promise<LicenceEntity> {
    const licenceEntity = new LicenceEntity();
    licenceEntity.licenceKey = licence.licenceKey ?? uuid();
    licenceEntity.plan = licence.plan;
    licenceEntity.organizationVcsId = licence.organizationVcsId;

    await this.repository.save(licenceEntity);

    return licenceEntity;
  }

  public empty() {
    return this.repository.delete({});
  }
}
