import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import AbstractEntity from '../abstract.entity';
import { VCSProvider } from '../../../../domain/model/vcs/vcs-provider.enum';
import VcsAccessToken from '../../../../domain/model/vcs/vcs.access-token.model';

@Entity('vcs-access-tokens')
export default class VcsAccessTokenEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  userId: string;
  @Column()
  jwtExpirationDate: number;
  @Column()
  vcsType: VCSProvider;
  @Column()
  accessToken: string;
  @Column({
    type: 'integer',
    nullable: true,
  })
  expirationDate: number | null;
  @Column({
    type: 'character varying',
    nullable: true,
  })
  refreshToken: string | null;

  public toDomain(): VcsAccessToken {
    return new VcsAccessToken(
      this.vcsType,
      this.userId,
      this.jwtExpirationDate,
      this.accessToken,
      this.expirationDate,
      this.refreshToken,
    );
  }

  static fromDomain(vcsAccessToken: VcsAccessToken): VcsAccessTokenEntity {
    const entity = new VcsAccessTokenEntity();
    entity.vcsType = vcsAccessToken.vcsType;
    entity.userId = vcsAccessToken.userId;
    entity.accessToken = vcsAccessToken.accessToken;
    entity.expirationDate = vcsAccessToken.expirationDate
      ? vcsAccessToken.expirationDate
      : null;
    entity.refreshToken = vcsAccessToken.refreshToken
      ? vcsAccessToken.refreshToken
      : null;

    return entity;
  }
}
