import { EnvironmentAccess } from 'src/domain/model/environment-access/environment-access.model';

export interface EnvironmentAccessStoragePort {
  findOptionalForUserVcsIdAndEnvironmentId(
    userVcsId: number,
    environmentId: string,
  ): Promise<EnvironmentAccess | undefined>;
}
