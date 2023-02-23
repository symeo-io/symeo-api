export class VcsUser {
  id: number;
  name: string;
  avatarUrl: string;
  roleName: string;

  constructor(id: number, name: string, avatarUrl: string, roleName: string) {
    this.id = id;
    this.name = name;
    this.avatarUrl = avatarUrl;
    this.roleName = roleName;
  }
}
