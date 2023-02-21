import { EnvironmentAccessStoragePort } from 'src/domain/port/out/environment-access.storage.port';
import { EnvironmentAccess } from 'src/domain/model/environment-access/environment-access.model';
import { Repository } from 'typeorm';
import EnvironmentAccessEntity from 'src/infrastructure/postgres-adapter/entity/environment-access.entity';

export class PostgresEnvironmentAccessAdapter
  implements EnvironmentAccessStoragePort
{
  constructor(
    private environmentAccessRepository: Repository<EnvironmentAccessEntity>,
  ) {}
  async findOptionalForUserVcsIdAndEnvironmentId(
    userVcsId: number,
    environmentId: string,
  ): Promise<EnvironmentAccess | undefined> {
    const entity = await this.environmentAccessRepository.findOne({
      relations: {
        environment: true,
      },
      where: {
        userVcsId: userVcsId,
        environment: {
          id: environmentId,
        },
      },
    });

    if (!entity) return undefined;

    return entity.toDomain();
  }
}
