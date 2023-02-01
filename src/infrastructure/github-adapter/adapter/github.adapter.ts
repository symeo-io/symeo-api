import GithubAdapterPort from '../../../domain/port/out/github.adapter.port';
import User from '../../../domain/model/user.model';
import { GithubHttpClient } from '../github.http.client';
import { VcsOrganization } from 'src/domain/model/vcs.organization.model';
import { GithubOrganizationMapper } from '../mapper/github.organization.mapper';

export default class GithubAdapter implements GithubAdapterPort {
  constructor(private githubHttpClient: GithubHttpClient) {}

  async getOrganizations(user: User): Promise<VcsOrganization[]> {
    const githubOrganizationDTOS = await this.githubHttpClient.getOrganizations(
      user,
    );
    return GithubOrganizationMapper.dtoToDomain(githubOrganizationDTOS);
  }
}
