import User from 'src/domain/model/user.model';

export default interface VCSAccessTokenStorage {
  getGitHubAccessToken(user: User): Promise<string | undefined>;
}
