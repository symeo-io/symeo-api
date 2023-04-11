import VCSAccessTokenStoragePort from '../../../domain/port/out/vcs-access-token.storage.port';
import VcsAccessToken from '../../../domain/model/vcs/vcs.access-token.model';
import User from '../../../domain/model/user/user.model';

export class InMemoryVcsAccessTokenCacheAdapter
  implements VCSAccessTokenStoragePort
{
  private cache: Record<string, Record<number, VcsAccessToken | undefined>> =
    {};

  async findByUser(user: User): Promise<VcsAccessToken | undefined> {
    return this.cache[user.id][user.accessTokenExpiration];
  }

  async save(vcsAccessToken: VcsAccessToken): Promise<void> {
    this.cache[vcsAccessToken.userId] = {
      [vcsAccessToken.jwtExpirationDate]: vcsAccessToken,
    };
  }
}
