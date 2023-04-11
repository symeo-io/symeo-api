import User from 'src/domain/model/user/user.model';
import VcsAccessToken from '../../model/vcs/vcs.access-token.model';

export default interface VCSAccessTokenStoragePort {
  findByUser(user: User): Promise<VcsAccessToken | undefined>;
  save(vcsAccessToken: VcsAccessToken): Promise<void>;
}
