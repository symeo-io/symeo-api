import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { VcsRepository } from 'src/domain/model/vcs.repository.model';

export class VcsRepositoryDTO {
  name: string;
  organization: string;
  pushedAt: string;
  vcsType: VCSProvider;
  vcsUrl: string;

  constructor(
    name: string,
    organization: string,
    pushedAt: string,
    vcsType: VCSProvider,
    vcsUrl: string,
  ) {
    this.name = name;
    this.organization = organization;
    this.pushedAt = pushedAt;
    this.vcsType = vcsType;
    this.vcsUrl = vcsUrl;
  }

  public static fromDomains(repositories: VcsRepository[]): VcsRepositoryDTO[] {
    return repositories.map(VcsRepositoryDTO.fromDomain);
  }

  public static fromDomain(repository: VcsRepository): VcsRepositoryDTO {
    return new VcsRepositoryDTO(
      repository.name,
      repository.organization,
      repository.pushedAt,
      repository.vcsType,
      repository.vcsUrl,
    );
  }
}
