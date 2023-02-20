import { EnvironmentAccessRole } from 'src/domain/model/right/environment-access-role.enum';

export class Right {
  user: { name: string; vcsId: number; avatarUrl: string };
  right: EnvironmentAccessRole;

  constructor(
    user: { name: string; vcsId: number; avatarUrl: string },
    right: EnvironmentAccessRole,
  ) {
    this.user = user;
    this.right = right;
  }
}
