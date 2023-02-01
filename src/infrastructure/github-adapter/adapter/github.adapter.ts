import GithubAdapterPort from '../../../domain/port/out/github.adapter.port';
import User from '../../../domain/model/user.model';
import { GithubHttpClient } from '../github.http.client';
import { VcsOrganization } from '../../../domain/model/vcs.organization.model';
import { GithubOrganizationDTO } from '../dto/github.organization.dto';
import { GithubOrganizationMapper } from '../mapper/github.organization.mapper';

export default class GithubAdapter implements GithubAdapterPort {
  constructor(private githubHttpClient: GithubHttpClient) {}

  async collectRepositoriesForVcsOrganization(
    vcsOrganizationName: string,
  ): Promise<void> {
    const pageNumber = 1;
  }

  async getOrganizationsForUser(
    authenticatedUser: User,
  ): Promise<VcsOrganization[]> {
    const githubOrganizationDTOS: GithubOrganizationDTO[] =
      await this.githubHttpClient
        .getOrganizationsForUser(authenticatedUser)
        .then((response) => response as GithubOrganizationDTO[]);
    return GithubOrganizationMapper.dtoToDomain(githubOrganizationDTOS);
  }
}
