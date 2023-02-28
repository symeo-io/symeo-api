import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';

export class VcsUser {
  id: number;
  name: string;
  avatarUrl: string;
  vcsRepositoryRole: VcsRepositoryRole;

  constructor(
    id: number,
    name: string,
    avatarUrl: string,
    vcsRepositoryRole: VcsRepositoryRole,
  ) {
    this.id = id;
    this.name = name;
    this.avatarUrl = avatarUrl;
    this.vcsRepositoryRole = vcsRepositoryRole;
  }
}
