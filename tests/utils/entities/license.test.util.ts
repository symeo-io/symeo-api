import { Repository } from 'typeorm';
import LicenseEntity from '../../../src/infrastructure/postgres-adapter/entity/license/license.entity';
import { AppClient } from '../app.client';
import { getRepositoryToken } from '@nestjs/typeorm';
import License from '../../../src/domain/model/license/license.model';
import { v4 as uuid } from 'uuid';

export class LicenseTestUtil {
  public repository: Repository<LicenseEntity>;
  constructor(private appClient: AppClient) {
    this.repository = appClient.module.get<Repository<LicenseEntity>>(
      getRepositoryToken(LicenseEntity),
    );
  }

  public async createLicense(license: License): Promise<LicenseEntity> {
    const licenseEntity = new LicenseEntity();
    licenseEntity.licenseKey = license.licenseKey ?? uuid();
    licenseEntity.plan = license.plan;
    licenseEntity.organizationVcsId = license.organizationVcsId;

    await this.repository.save(licenseEntity);

    return licenseEntity;
  }

  public empty() {
    return this.repository.delete({});
  }
}
