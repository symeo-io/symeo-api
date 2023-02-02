import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { VcsRepository } from 'src/domain/model/vcs.repository.model';

export class VcsRepositoryDTO {
  vcsId: number;
  name: string;
  owner: { vcsId: number; name: string; avatarUrl: string };
  pushedAt?: string;
  vcsType: VCSProvider;
  vcsUrl: string;

  constructor(
    vcsId: number,
    name: string,
    owner: { vcsId: number; name: string; avatarUrl: string },
    pushedAt: string | undefined,
    vcsType: VCSProvider,
    vcsUrl: string,
  ) {
    this.vcsId = vcsId;
    this.name = name;
    this.owner = owner;
    this.pushedAt = pushedAt;
    this.vcsType = vcsType;
    this.vcsUrl = vcsUrl;
  }

  public static fromDomains(repositories: VcsRepository[]): VcsRepositoryDTO[] {
    return repositories.map(VcsRepositoryDTO.fromDomain);
  }

  public static fromDomain(repository: VcsRepository): VcsRepositoryDTO {
    return new VcsRepositoryDTO(
      repository.id,
      repository.name,
      {
        vcsId: repository.owner.id,
        name: repository.owner.name,
        avatarUrl: repository.owner.avatarUrl,
      },
      repository.pushedAt?.toISOString(),
      repository.vcsType,
      repository.vcsUrl,
    );
  }
}
