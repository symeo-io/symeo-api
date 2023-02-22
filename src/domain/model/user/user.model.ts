import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';

export default class User {
  public id: string;
  public email: string;
  public provider: VCSProvider;
  public accessTokenExpiration: number;

  constructor(
    id: string,
    email: string,
    provider: VCSProvider,
    accessTokenExpiration: number,
  ) {
    this.id = id;
    this.email = email;
    this.provider = provider;
    this.accessTokenExpiration = accessTokenExpiration;
  }
}
