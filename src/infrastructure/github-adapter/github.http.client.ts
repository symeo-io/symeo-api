import { User } from '../../domain/model/user.model';
import { HttpService } from '@nestjs/axios';
import { GithubOrganizationDTO } from './dto/github.organization.dto';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

export class GithubHttpClient {
  private readonly apiUrl = 'https://api.github.com/';
  constructor(private readonly httpService: HttpService) {}

  async getOrganizationsForUser(
    authenticatedUser: User,
  ): Promise<GithubOrganizationDTO[]> {
    const uri: string = this.apiUrl + 'user/orgs';
    return this.get(uri, authenticatedUser);
  }

  private get(
    uri: string,
    authenticatedUser: User,
  ): Promise<GithubOrganizationDTO[]> {
    const githubAuthenticationToken: string | null =
      this.getGithubAuthenticationHeader(authenticatedUser);
    const requestConfig: AxiosRequestConfig = {
      method: 'get',
      url: uri,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + githubAuthenticationToken,
      },
    };

    return firstValueFrom(this.httpService.request(requestConfig)).then(
      async (result) => {
        const httpStatus = result.status;
        if (httpStatus === 200) {
          return result.data;
        } else if (httpStatus === 401) {
          this.flushGithubAuthenticationHeader(authenticatedUser);
          await this.get(uri, authenticatedUser);
        } else {
          throw new Error('Internal Server Error');
        }
      },
    );
  }

  private flushGithubAuthenticationHeader(authenticatedUser: User) {
    // TODO : implement remove mapping user to token
  }

  private getGithubAuthenticationHeader(authenticatedUser: User): string {
    // TODO : Implementing the method of verification
    return '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';
  }
}
