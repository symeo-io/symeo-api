export default interface RepositoryFacade {
  collectRepositoriesForVcsOrganization(
    vcsOrganizationName: string,
  ): Promise<void>;
}
