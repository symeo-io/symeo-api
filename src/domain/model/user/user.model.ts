import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';

export default class User {
  public id: string;
  public email: string;
  public username: string;
  public provider: VCSProvider;
  public accessTokenExpiration: number;

  constructor(
    id: string,
    email: string,
    username: string,
    provider: VCSProvider,
    accessTokenExpiration: number,
  ) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.provider = provider;
    this.accessTokenExpiration = accessTokenExpiration;
  }

  public getVcsUserId(): number {
    return parseInt(this.id.replace('oauth2|', '').split('|')[1]);
  }
}
