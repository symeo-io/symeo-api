import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';

export class GitlabAccessLevelMapper {
  static accessLevelToVcsRepositoryRole(
    accessLevel: number,
  ): VcsRepositoryRole {
    switch (accessLevel) {
      case 50:
        return VcsRepositoryRole.ADMIN;
      case 40:
        return VcsRepositoryRole.MAINTAIN;
      case 30:
        return VcsRepositoryRole.WRITE;
      case 20:
        return VcsRepositoryRole.TRIAGE;
      case 10:
        return VcsRepositoryRole.READ;
      default:
        return VcsRepositoryRole.NONE;
    }
  }
}
