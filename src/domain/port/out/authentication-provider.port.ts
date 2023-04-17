import User from '../../model/user/user.model';
import { AuthenticationProviderUser } from '../../model/user/authentication-provider-user.model';
import { VCSProvider } from '../../model/vcs/vcs-provider.enum';

export interface AuthenticationProviderPort {
  getUser(
    user: User,
    vcsProvider: VCSProvider,
  ): Promise<AuthenticationProviderUser | undefined>;
}
