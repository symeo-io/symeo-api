import { AppClient } from 'tests/utils/app.client';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import User from 'src/domain/model/user/user.model';
import { v4 as uuid } from 'uuid';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { Repository } from 'typeorm';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import EnvironmentAccessEntity from 'src/infrastructure/postgres-adapter/entity/environment-access.entity';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { SymeoExceptionCodeToHttpStatusMap } from 'src/application/common/exception/symeo.exception.code.to.http.status.map';
import * as fs from 'fs';
import { EnvironmentAccessDTO } from 'src/application/webapp/dto/environment-access/environment-access.dto';
import SpyInstance = jest.SpyInstance;

describe('EnvironmentAccessController', () => {
  let appClient: AppClient;
  let environmentAccessRepository: Repository<EnvironmentAccessEntity>;
  let vcsAccessTokenStorage: VCSAccessTokenStorage;
  let githubClient: Octokit;
  let getGitHubAccessTokenMock: SpyInstance;
  let githubClientRequestMock: SpyInstance;

  const currentUser = new User(
    uuid(),
    faker.internet.email(),
    VCSProvider.GitHub,
    faker.datatype.number(),
  );

  beforeAll(async () => {
    appClient = new AppClient();
    await appClient.init();
    vcsAccessTokenStorage = appClient.module.get<VCSAccessTokenStorage>(
      'VCSAccessTokenAdapter',
    );
    githubClient = appClient.module.get<Octokit>('Octokit');
    environmentAccessRepository = appClient.module.get<
      Repository<EnvironmentAccessEntity>
    >(getRepositoryToken(ConfigurationEntity));
  }, 30000);

  afterAll(() => {
    appClient.close();
  });

  beforeEach(async () => {
    await environmentAccessRepository.delete({});
    githubClientRequestMock = jest.spyOn(githubClient, 'request');
    getGitHubAccessTokenMock = jest.spyOn(
      vcsAccessTokenStorage,
      'getGitHubAccessToken',
    );
    getGitHubAccessTokenMock.mockImplementation(() => Promise.resolve(uuid()));
  });

  afterEach(() => {
    githubClientRequestMock.mockRestore();
    getGitHubAccessTokenMock.mockRestore();
  });

  describe('(GET) /configurations/github/:vcsRepositoryId/:configurationId/environments/:environmentId/environment-accesses', () => {
    it('should return 404 for non existing repository', async () => {
      // Given
      const configurationId = uuid();
      const repositoryVcsId = 105865802;
      const environmentId = uuid();
      githubClientRequestMock.mockImplementation(() => {
        throw { status: 404 };
      });

      const response = await appClient
        .request(currentUser)
        // When
        .get(
          `/api/v1/configurations/github/${repositoryVcsId}/${configurationId}/environments/${environmentId}/environment-accesses`,
        )
        // Then
        .expect(404);
      expect(response.body.statusCode).toBe(
        SymeoExceptionCodeToHttpStatusMap[
          SymeoExceptionCode.REPOSITORY_NOT_FOUND
        ],
      );
      expect(response.body.message).toBe(
        `Repository not found for id ${repositoryVcsId}`,
      );
    });

    it('should return 200 with only github environment accesses', async () => {
      // Given
      const configurationId = uuid();
      const environmentId = uuid();
      const repositoryVcsId = 105865802;
      const repositoryVcsName = 'symeo-api';
      const ownerVcsId = 585863519;
      const ownerVcsName = 'symeo-io';

      const mockGitHubRepositoryResponse = {
        status: 200 as const,
        headers: {},
        url: '',
        data: {
          name: repositoryVcsName,
          id: repositoryVcsId,
          owner: { login: ownerVcsName, id: ownerVcsId },
        },
      };
      githubClientRequestMock.mockImplementation(() =>
        Promise.resolve(mockGitHubRepositoryResponse),
      );

      const mockGithubListCollaboratorsStub1 = JSON.parse(
        fs
          .readFileSync(
            './tests/utils/stubs/environment-access/get_environment_accesses_for_owner_and_repo_page_1.json',
          )
          .toString(),
      );

      const mockGithubListCollaboratorsResponse1 = {
        status: 200 as const,
        headers: {},
        url: '',
        data: mockGithubListCollaboratorsStub1,
      };

      jest
        .spyOn(githubClient.rest.repos, 'listCollaborators')
        .mockImplementationOnce(() =>
          Promise.resolve(mockGithubListCollaboratorsResponse1),
        );

      const response = await appClient
        .request(currentUser)
        // When
        .get(
          `/api/v1/configurations/github/${repositoryVcsId}/${configurationId}/environments/${environmentId}/environment-accesses`,
        )
        // Then
        .expect(200);
      expect(response.body.environmentAccesses).toBeDefined();
      expect(response.body.environmentAccesses.length).toEqual(4);
      const environmentAccessesUsersName =
        response.body.environmentAccesses.map(
          (environmentAccess: EnvironmentAccessDTO) =>
            `${environmentAccess.user.name}, ${environmentAccess.environmentAccessRole}`,
        );
      expect(environmentAccessesUsersName).toContain('PierreOucif, admin');
      expect(environmentAccessesUsersName).toContain('georgesbiaux, admin');
      expect(environmentAccessesUsersName).toContain(
        'Dorian-Frances, readNonSecrets',
      );
      expect(environmentAccessesUsersName).toContain(
        'agathedvlp, readNonSecrets',
      );
    });
  });
});
