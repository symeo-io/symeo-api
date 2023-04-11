import { VCSProvider } from './vcs-provider.enum';

export default class VcsAccessToken {
  vcsType: VCSProvider;
  userId: string;
  jwtExpirationDate: number;
  accessToken: string;
  expirationDate: number | null;
  refreshToken: string | null;

  constructor(
    vcsType: VCSProvider,
    userId: string,
    jwtExpirationDate: number,
    accessToken: string,
    expirationDate: number | null,
    refreshToken: string | null,
  ) {
    this.vcsType = vcsType;
    this.userId = userId;
    this.jwtExpirationDate = jwtExpirationDate;
    this.accessToken = accessToken;
    this.expirationDate = expirationDate;
    this.refreshToken = refreshToken;
  }
}
