import { EnvironmentPermissionStoragePort } from 'src/domain/port/out/environment-permission.storage.port';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { In, Repository } from 'typeorm';
import EnvironmentPermissionEntity from 'src/infrastructure/postgres-adapter/entity/environment-permission.entity';
import { Logger } from '@nestjs/common';

export class PostgresEnvironmentPermissionAdapter
  implements EnvironmentPermissionStoragePort
{
  constructor(
    private environmentPermissionRepository: Repository<EnvironmentPermissionEntity>,
  ) {}
  async findForEnvironmentIdAndVcsUserId(
    environmentId: string,
    userVcsId: number,
  ): Promise<EnvironmentPermission | undefined> {
    const entity = await this.environmentPermissionRepository.findOne({
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
  async findForEnvironmentIdsAndVcsUserId(
    environmentIds: string[],
    userVcsId: number,
  ): Promise<EnvironmentPermission[]> {
    const entities = await this.environmentPermissionRepository.find({
      relations: {
        environment: true,
      },
      where: {
        userVcsId,
        environment: {
          id: In(environmentIds),
        },
      },
    });

    if (!entities) return [];

    return entities.map((entity) => entity.toDomain());
  }
  async saveAll(
    environmentPermissions: EnvironmentPermission[],
  ): Promise<void> {
    const clock = Date.now();
    Logger.log(
      `Starting to save ${environmentPermissions.length} EnvironmentPermissions in base`,
    );
    await this.environmentPermissionRepository.save(
      environmentPermissions.map((environmentPermission) =>
        EnvironmentPermissionEntity.fromDomain(environmentPermission),
      ),
    );
    Logger.log(
      `Successfully saved ${
        environmentPermissions.length
      } EnvironmentPermissions in base - Executed in : ${
        (Date.now() - clock) / 1000
      } s`,
    );
  }

  async findForEnvironmentId(
    environmentId: string,
  ): Promise<EnvironmentPermission[]> {
    const entities = await this.environmentPermissionRepository.find({
      relations: {
        environment: true,
      },
      where: {
        environment: {
          id: environmentId,
        },
      },
    });

    if (!entities) return [];

    return entities.map((entity) => entity.toDomain());
  }

  async removeAll(
    environmentPermissions: EnvironmentPermission[],
  ): Promise<void> {
    await this.environmentPermissionRepository.remove(
      environmentPermissions.map((environmentPermission) =>
        EnvironmentPermissionEntity.fromDomain(environmentPermission),
      ),
    );
  }
}
