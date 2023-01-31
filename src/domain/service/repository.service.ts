import RepositoryFacade from '../port/in/repository.facade.port';
import GithubAdapterPort from '../port/out/github.adapter.port';

export class RepositoryService implements RepositoryFacade {
  constructor(private readonly githubAdapterPort: GithubAdapterPort) {}

  async collectRepositoriesForVcsOrganization(
    vcsOrganizationName: string,
  ): Promise<void> {
    await this.githubAdapterPort.collectRepositoriesForVcsOrganization(
      vcsOrganizationName,
    );
  }
}
