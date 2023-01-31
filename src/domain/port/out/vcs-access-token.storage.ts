export default interface VCSAccessTokenStorage {
  getGitHubAccessToken(userId: string): Promise<string | undefined>;
}
