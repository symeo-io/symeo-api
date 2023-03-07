import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { GithubOwnerDTO } from 'src/infrastructure/github-adapter/dto/github.owner.dto';
import { GithubAuthenticatedUserDTO } from 'src/infrastructure/github-adapter/dto/github.authenticated.user.dto';

export class GithubOrganizationMapper {
  static dtoToDomains(
    githubOrganizationDTOs: GithubOwnerDTO[],
  ): VcsOrganization[] {
    return githubOrganizationDTOs.map(this.dtoToDomain);
  }

  static dtoToDomain(githubOrganizationDTO: GithubOwnerDTO): VcsOrganization {
    return new VcsOrganization(
      githubOrganizationDTO.id,
      githubOrganizationDTO.login,
      githubOrganizationDTO.avatarUrl,
      VCSProvider.GitHub,
    );
  }

  static githubUserDtoToDomain(
    githubUserDTO: GithubAuthenticatedUserDTO,
  ): VcsOrganization {
    return new VcsOrganization(
      githubUserDTO.id,
      githubUserDTO.login,
      githubUserDTO.avatarUrl,
      VCSProvider.GitHub,
    );
  }
}
