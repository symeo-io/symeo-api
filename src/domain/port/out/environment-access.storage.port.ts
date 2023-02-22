import { EnvironmentAccess } from 'src/domain/model/environment-access/environment-access.model';

export interface EnvironmentAccessStoragePort {
  findForEnvironmentIdAndVcsUserIds(
    environmentId: string,
    vcsUserIds: number[],
  ): Promise<EnvironmentAccess[]>;
}
