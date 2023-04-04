import { OrganizationFacade } from '../port/in/organization.facade.port';
import GithubAdapterPort from '../port/out/github.adapter.port';
import User from 'src/domain/model/user/user.model';
import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { GitlabAdapterPort } from 'src/domain/port/out/gitlab.adapter.port';

export class OrganizationService implements OrganizationFacade {
  constructor(
    private readonly githubAdapterPort: GithubAdapterPort,
    private readonly gitlabAdapterPort: GitlabAdapterPort,
  ) {}

  async getOrganizations(user: User): Promise<VcsOrganization[]> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return await this.githubAdapterPort.getOrganizations(user);
      case VCSProvider.Gitlab:
        return await this.gitlabAdapterPort.getOrganizations(user);
      default:
        return [];
    }
  }
}
