import { EnvironmentAccessStoragePort } from 'src/domain/port/out/environment-access.storage.port';
import { EnvironmentAccess } from 'src/domain/model/environment-access/environment-access.model';
import { In, Repository } from 'typeorm';
import EnvironmentAccessEntity from 'src/infrastructure/postgres-adapter/entity/environment-access.entity';

export class PostgresEnvironmentAccessAdapter
  implements EnvironmentAccessStoragePort
{
  constructor(
    private environmentAccessRepository: Repository<EnvironmentAccessEntity>,
  ) {}

  async findForEnvironmentIdAndVcsUserIds(
    environmentId: string,
    vcsUserIds: number[],
  ): Promise<EnvironmentAccess[]> {
    const entities = await this.environmentAccessRepository.find({
      relations: {
        environment: true,
      },
      where: {
        userVcsId: In(vcsUserIds),
        environment: {
          id: environmentId,
        },
      },
    });

    if (!entities) return [];

    return entities.map((entity) => entity.toDomain());
  }
}
