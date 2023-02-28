import { VcsRepositoryRoleEnum } from 'src/domain/model/vcs/vcs.repository.role.enum';

export class VcsUser {
  id: number;
  name: string;
  avatarUrl: string;
  vcsRepositoryRole: VcsRepositoryRoleEnum;

  constructor(
    id: number,
    name: string,
    avatarUrl: string,
    vcsRepositoryRole: VcsRepositoryRoleEnum,
  ) {
    this.id = id;
    this.name = name;
    this.avatarUrl = avatarUrl;
    this.vcsRepositoryRole = vcsRepositoryRole;
  }
}
