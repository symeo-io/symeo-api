import { ApiProperty } from '@nestjs/swagger';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';

export class VcsUserDTO {
  @ApiProperty()
  vcsId: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  avatarUrl: string;
  @ApiProperty()
  roleName: string;

  constructor(
    vcsId: number,
    name: string,
    avatarUrl: string,
    roleName: string,
  ) {
    this.vcsId = vcsId;
    this.name = name;
    this.avatarUrl = avatarUrl;
    this.roleName = roleName;
  }

  static fromDomain(vcsUser: VcsUser): VcsUserDTO {
    return new VcsUserDTO(
      vcsUser.id,
      vcsUser.name,
      vcsUser.avatarUrl,
      vcsUser.role,
    );
  }
}
