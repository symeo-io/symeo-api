import User from 'src/domain/model/user/user.model';

export default interface VCSAccessTokenStorage {
  getAccessToken(user: User): Promise<string | undefined>;
}
