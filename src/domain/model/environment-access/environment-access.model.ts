import { EnvironmentAccessRole } from 'src/domain/model/environment-access/environment-access-role.enum';

export class EnvironmentAccess {
  id: string;
  user: { name: string; vcsId: number; avatarUrl: string };
  environmentAccessRole: EnvironmentAccessRole;

  constructor(
    id: string,
    user: { name: string; vcsId: number; avatarUrl: string },
    environmentAccessRole: EnvironmentAccessRole,
  ) {
    this.id = id;
    this.user = user;
    this.environmentAccessRole = environmentAccessRole;
  }
}
