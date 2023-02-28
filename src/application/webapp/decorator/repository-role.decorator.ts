import { SetMetadata } from '@nestjs/common';
import { VcsRepositoryRoleEnum } from 'src/domain/model/vcs/vcs.repository.role.enum';

export const REPOSITORY_ROLES_KEY = 'repositoryRoles';
export const MinimumVcsRepositoryRoleRequired = (
  minimumRepositoryRoleRequired: VcsRepositoryRoleEnum,
) => SetMetadata(REPOSITORY_ROLES_KEY, minimumRepositoryRoleRequired);
