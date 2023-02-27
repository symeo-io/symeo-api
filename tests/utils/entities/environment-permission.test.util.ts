import { AppClient } from 'tests/utils/app.client';
import { Repository } from 'typeorm';
import EnvironmentPermissionEntity from 'src/infrastructure/postgres-adapter/entity/environment-permission.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import EnvironmentEntity from 'src/infrastructure/postgres-adapter/entity/environment.entity';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';

export class EnvironmentPermissionTestUtil {
  public repository: Repository<EnvironmentPermissionEntity>;
  constructor(appClient: AppClient) {
    this.repository = appClient.module.get<
      Repository<EnvironmentPermissionEntity>
    >(getRepositoryToken(EnvironmentPermissionEntity));
  }

  public async createEnvironmentPermission(
    environment: EnvironmentEntity,
    role: EnvironmentPermissionRole,
    userVcsId: number,
  ): Promise<EnvironmentPermissionEntity> {
    const environmentPermission = new EnvironmentPermissionEntity();
    environmentPermission.id = uuid();
    environmentPermission.environment = environment;
    environmentPermission.environmentPermissionRole = role;
    environmentPermission.userVcsId = userVcsId;

    await this.repository.save(environmentPermission);

    return environmentPermission;
  }
  public empty() {
    return this.repository.delete({});
  }
}
