export class AuthenticationProviderUser {
  userId: string;
  connection: string;
  accessToken: string;
  refreshToken?: string;

  constructor(
    userId: string,
    connection: string,
    accessToken: string,
    refreshToken?: string,
  ) {
    this.userId = userId;
    this.connection = connection;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
