import VCSAccessTokenStoragePort from '../../../domain/port/out/vcs-access-token.storage.port';
import VcsAccessTokenEntity from '../entity/vcs/vcs-access-token.entity';
import VcsAccessToken from '../../../domain/model/vcs/vcs.access-token.model';
import User from '../../../domain/model/user/user.model';
import { Repository } from 'typeorm';

export class PostgresVcsAccessTokenAdapter
  implements VCSAccessTokenStoragePort
{
  constructor(
    private vcsAccessTokenRepository: Repository<VcsAccessTokenEntity>,
  ) {}

  async findByUser(user: User): Promise<VcsAccessToken | undefined> {
    const entity = await this.vcsAccessTokenRepository.findOneBy({
      userId: user.id,
    });

    return entity?.toDomain();
  }

  async save(vcsAccessToken: VcsAccessToken): Promise<void> {
    await this.vcsAccessTokenRepository.save(
      VcsAccessTokenEntity.fromDomain(vcsAccessToken),
    );
  }
}
