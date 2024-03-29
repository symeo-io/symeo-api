import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import ConfigurationDTO from 'src/application/webapp/dto/configuration/configuration.dto';
import { ApiProperty } from '@nestjs/swagger';

export class VcsRepositoryDTO {
  @ApiProperty()
  vcsId: number;
  @ApiProperty()
  name: string;
  @ApiProperty({
    type: 'object',
    properties: {
      vcsId: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      avatarUrl: {
        type: 'string',
      },
    },
  })
  owner: { vcsId: number; name: string; avatarUrl: string };
  @ApiProperty()
  pushedAt?: string;
  @ApiProperty()
  vcsType: VCSProvider;
  @ApiProperty()
  vcsUrl: string;
  @ApiProperty({ type: ConfigurationDTO })
  configurations?: ConfigurationDTO[];
  @ApiProperty()
  isCurrentUserAdmin: boolean;
  @ApiProperty()
  defaultBranch: string;

  constructor(
    vcsId: number,
    name: string,
    owner: { vcsId: number; name: string; avatarUrl: string },
    pushedAt: string | undefined,
    vcsType: VCSProvider,
    vcsUrl: string,
    isCurrentUserRepositoryAdmin: boolean,
    defaultBranch: string,
    configurations?: ConfigurationDTO[],
  ) {
    this.vcsId = vcsId;
    this.name = name;
    this.owner = owner;
    this.pushedAt = pushedAt;
    this.vcsType = vcsType;
    this.vcsUrl = vcsUrl;
    this.isCurrentUserAdmin = isCurrentUserRepositoryAdmin;
    this.defaultBranch = defaultBranch;
    this.configurations = configurations;
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
      repository.isCurrentUserAdmin,
      repository.defaultBranch,
      repository.configurations?.map((configuration) =>
        ConfigurationDTO.fromDomain(configuration),
      ),
    );
  }
}
