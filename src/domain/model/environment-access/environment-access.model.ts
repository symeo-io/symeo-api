import { EnvironmentAccessRole } from 'src/domain/model/environment-access/environment-access-role.enum';

export class EnvironmentAccess {
  id: string;
  userVcsId: number;
  environmentAccessRole: EnvironmentAccessRole;

  constructor(
    id: string,
    userVcsId: number,
    environmentAccessRole: EnvironmentAccessRole,
  ) {
    this.id = id;
    this.userVcsId = userVcsId;
    this.environmentAccessRole = environmentAccessRole;
  }
}
