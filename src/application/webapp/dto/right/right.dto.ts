import { EnvironmentAccessRole } from 'src/domain/model/right/environment-access-role.enum';
import { Right } from 'src/domain/model/right/right.model';

export class RightDTO {
  user: { vcsId: number; name: string; avatarUrl: string };
  right: EnvironmentAccessRole;

  constructor(
    user: { vcsId: number; name: string; avatarUrl: string },
    right: EnvironmentAccessRole,
  ) {
    this.user = user;
    this.right = right;
  }

  static fromDomain(right: Right): RightDTO {
    return new RightDTO(right.user, right.right);
  }
}
