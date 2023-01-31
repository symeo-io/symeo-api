import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

export default class User {
  public id: string;
  public email: string;
  public provider: VCSProvider;

  constructor(id: string, email: string, provider: VCSProvider) {
    this.id = id;
    this.email = email;
    this.provider = provider;
  }
}
