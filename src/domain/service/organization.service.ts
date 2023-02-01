import { OrganizationFacade } from '../port/in/organization.facade.port';
import GithubAdapterPort from '../port/out/github.adapter.port';
import User from '../model/user.model';
import { VcsOrganization } from '../model/vcs.organization.model';

export class OrganizationService implements OrganizationFacade {
  constructor(private readonly githubAdapterPort: GithubAdapterPort) {}

  async getOrganizationsForUser(
    authenticatedUser: User,
  ): Promise<VcsOrganization[]> {
    return await this.githubAdapterPort.getOrganizationsForUser(
      authenticatedUser,
    );
  }
}
