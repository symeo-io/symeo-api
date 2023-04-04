import { GitlabOwnerDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.owner.dto';
import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { GitlabAuthenticatedUserDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.authenticated.user.dto';

export class GitlabOrganizationMapper {
  static dtoToDomains(
    gitlabOrganizationDTOs: GitlabOwnerDTO[],
  ): VcsOrganization[] {
    return gitlabOrganizationDTOs.map(this.dtoToDomain);
  }

  static dtoToDomain(gitlabOrganizationDTO: GitlabOwnerDTO): VcsOrganization {
    return new VcsOrganization(
      gitlabOrganizationDTO.id,
      gitlabOrganizationDTO.name,
      gitlabOrganizationDTO.avatarUrl,
      VCSProvider.Gitlab,
    );
  }

  static gitlabUserDtoToDomain(
    gitlabUserDTO: GitlabAuthenticatedUserDTO,
  ): VcsOrganization {
    return new VcsOrganization(
      gitlabUserDTO.id,
      gitlabUserDTO.username,
      gitlabUserDTO.avatarUrl,
      VCSProvider.Gitlab,
    );
  }
}
