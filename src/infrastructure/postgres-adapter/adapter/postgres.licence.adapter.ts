import { LicenceStoragePort } from '../../../domain/port/out/licence.storage.port';
import { In, Repository } from 'typeorm';
import Licence from '../../../domain/model/licence/licence.model';
import LicenceEntity from '../entity/licence/licence.entity';

export class PostgresLicenceAdapter implements LicenceStoragePort {
  constructor(private licenceRepository: Repository<LicenceEntity>) {}
  async findForOrganizationIds(
    vcsOrganizationIds: number[],
  ): Promise<Licence[] | undefined> {
    const entities = await this.licenceRepository.findBy({
      organizationVcsId: In(vcsOrganizationIds),
    });
    return entities.map((entity) => entity.toDomain());
  }

  async findForLicenceKey(licenceKey: string): Promise<Licence | undefined> {
    const entity = await this.licenceRepository.findOneBy({
      licenceKey: licenceKey,
    });
    if (!entity) {
      return undefined;
    }
    return entity.toDomain();
  }

  async save(licence: Licence): Promise<void> {
    await this.licenceRepository.save(LicenceEntity.fromDomain(licence));
  }
}
