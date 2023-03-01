import { SetMetadata } from '@nestjs/common';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';

export const REPOSITORY_ROLES_KEY = 'repositoryRoles';
export const RequiredRepositoryRole = (
  minimumRepositoryRoleRequired: VcsRepositoryRole,
) => SetMetadata(REPOSITORY_ROLES_KEY, minimumRepositoryRoleRequired);
