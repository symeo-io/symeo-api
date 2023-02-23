import { EnvironmentPermissionStoragePort } from 'src/domain/port/out/environment-permission.storage.port';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { In, Repository } from 'typeorm';
import EnvironmentPermissionEntity from 'src/infrastructure/postgres-adapter/entity/environment-permission.entity';

export class PostgresEnvironmentPermissionAdapter
  implements EnvironmentPermissionStoragePort
{
  constructor(
    private environmentPermissionRepository: Repository<EnvironmentPermissionEntity>,
  ) {}

  async findForEnvironmentIdAndVcsUserIds(
    environmentId: string,
    vcsUserIds: number[],
  ): Promise<EnvironmentPermission[]> {
    const entities = await this.environmentPermissionRepository.find({
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
