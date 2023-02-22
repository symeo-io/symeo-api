export class VcsUser {
  id: number;
  roleName: string;

  constructor(id: number, roleName: string) {
    this.id = id;
    this.roleName = roleName;
  }
}
