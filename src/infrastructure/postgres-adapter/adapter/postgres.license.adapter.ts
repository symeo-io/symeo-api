import { LicenseStoragePort } from '../../../domain/port/out/license.storage.port';
import { In, Repository } from 'typeorm';
import License from '../../../domain/model/license/license.model';
import LicenseEntity from '../entity/license/license.entity';

export class PostgresLicenseAdapter implements LicenseStoragePort {
  constructor(private licenseRepository: Repository<LicenseEntity>) {}
  async findForOrganizationIds(
    vcsOrganizationIds: number[],
  ): Promise<License[] | undefined> {
    const entities = await this.licenseRepository.findBy({
      organizationVcsId: In(vcsOrganizationIds),
    });
    return entities.map((entity) => entity.toDomain());
  }

  async findForLicenseKey(licenseKey: string): Promise<License | undefined> {
    const entity = await this.licenseRepository.findOneBy({
      licenseKey: licenseKey,
    });
    if (!entity) {
      return undefined;
    }
    return entity.toDomain();
  }

  async save(license: License): Promise<void> {
    await this.licenseRepository.save(LicenseEntity.fromDomain(license));
  }
}
