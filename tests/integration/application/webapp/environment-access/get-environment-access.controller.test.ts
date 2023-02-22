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
import EnvironmentEntity from 'src/infrastructure/postgres-adapter/entity/environment.entity';
import { EnvironmentAccessRole } from 'src/domain/model/environment-access/environment-access-role.enum';
import SpyInstance = jest.SpyInstance;

describe('EnvironmentAccessController', () => {
  let appClient: AppClient;
  let environmentAccessRepository: Repository<EnvironmentAccessEntity>;
  let configurationRepository: Repository<ConfigurationEntity>;
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
    >(getRepositoryToken(EnvironmentAccessEntity));
    configurationRepository = appClient.module.get<
      Repository<ConfigurationEntity>
    >(getRepositoryToken(ConfigurationEntity));
  }, 30000);

  afterAll(() => {
    appClient.close();
  });

  beforeEach(async () => {
    await environmentAccessRepository.delete({});
    await configurationRepository.delete({});
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
    describe('should return 404', () => {
      it('should return 404 for non existing repository', async () => {
        // Given
        const configurationId = uuid();
        const repositoryVcsId = 593240835;
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
    });

    describe('should return 200', () => {
      const configurationId = uuid();
      const environmentId = uuid();
      const repositoryVcsId = 593240835;
      const repositoryVcsName = 'symeo-api';
      const ownerVcsId = 105865802;
      const ownerVcsName = 'symeo-io';

      beforeEach(() => {
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
        const mockGithubListCollaboratorsStub2 = JSON.parse(
          fs
            .readFileSync(
              './tests/utils/stubs/environment-access/get_environment_accesses_for_owner_and_repo_page_2.json',
            )
            .toString(),
        );
        const mockGithubListCollaboratorsStub3 = JSON.parse(
          fs
            .readFileSync(
              './tests/utils/stubs/environment-access/get_environment_accesses_for_owner_and_repo_page_3.json',
            )
            .toString(),
        );

        const mockGithubListCollaboratorsResponse1 = {
          status: 200 as const,
          headers: {},
          url: '',
          data: mockGithubListCollaboratorsStub1,
        };

        const mockGithubListCollaboratorsResponse2 = {
          status: 200 as const,
          headers: {},
          url: '',
          data: mockGithubListCollaboratorsStub2,
        };

        const mockGithubListCollaboratorsResponse3 = {
          status: 200 as const,
          headers: {},
          url: '',
          data: mockGithubListCollaboratorsStub3,
        };

        const mockGithubListCollaboratorsResponse4 = {
          status: 200 as const,
          headers: {},
          url: '',
          data: [],
        };

        jest
          .spyOn(githubClient.rest.repos, 'listCollaborators')
          .mockImplementationOnce(() =>
            Promise.resolve(mockGithubListCollaboratorsResponse1),
          );

        jest
          .spyOn(githubClient.rest.repos, 'listCollaborators')
          .mockImplementationOnce(() =>
            Promise.resolve(mockGithubListCollaboratorsResponse2),
          );

        jest
          .spyOn(githubClient.rest.repos, 'listCollaborators')
          .mockImplementationOnce(() =>
            Promise.resolve(mockGithubListCollaboratorsResponse3),
          );

        jest
          .spyOn(githubClient.rest.repos, 'listCollaborators')
          .mockImplementationOnce(() =>
            Promise.resolve(mockGithubListCollaboratorsResponse4),
          );
      });

      it('should return 200 with only github environment accesses', async () => {
        // Given
        const response = await appClient
          .request(currentUser)
          // When
          .get(
            `/api/v1/configurations/github/${repositoryVcsId}/${configurationId}/environments/${environmentId}/environment-accesses`,
          )
          // Then
          .expect(200);
        expect(response.body.environmentAccesses).toBeDefined();
        expect(response.body.environmentAccesses.length).toEqual(3);
        const environmentAccessesVerification =
          response.body.environmentAccesses.map(
            (environmentAccess: EnvironmentAccessDTO) =>
              `${environmentAccess.userVcsId} - ${environmentAccess.environmentAccessRole}`,
          );
        expect(environmentAccessesVerification).toContain('16590657 - admin');
        expect(environmentAccessesVerification).toContain('22441392 - admin');
        expect(environmentAccessesVerification).toContain(
          '102222086 - readNonSecret',
        );
      });

      it('should return 200 with mixed github and inBase environment accesses', async () => {
        // Given

        const environmentAccessEntity1 = new EnvironmentAccessEntity();
        environmentAccessEntity1.id = uuid();
        environmentAccessEntity1.userVcsId = 16590657;
        environmentAccessEntity1.environmentAccessRole =
          EnvironmentAccessRole.READ_SECRET;

        const environmentAccessEntity2 = new EnvironmentAccessEntity();
        environmentAccessEntity2.id = uuid();
        environmentAccessEntity2.userVcsId = 22441392;
        environmentAccessEntity2.environmentAccessRole =
          EnvironmentAccessRole.WRITE;

        const environmentEntity = new EnvironmentEntity();
        environmentEntity.id = environmentId;
        environmentEntity.name = faker.name.firstName();
        environmentEntity.color = 'blue';
        environmentEntity.environmentAccesses = [
          environmentAccessEntity1,
          environmentAccessEntity2,
        ];

        const configurationEntity = new ConfigurationEntity();
        configurationEntity.id = configurationId;
        configurationEntity.name = faker.name.jobTitle();
        configurationEntity.vcsType = VCSProvider.GitHub;
        configurationEntity.repositoryVcsId = repositoryVcsId;
        configurationEntity.repositoryVcsName = repositoryVcsName;
        configurationEntity.ownerVcsId = ownerVcsId;
        configurationEntity.ownerVcsName = ownerVcsName;
        configurationEntity.contractFilePath = './symeo.config.yml';
        configurationEntity.branch = 'staging';
        configurationEntity.environments = [environmentEntity];

        await configurationRepository.save(configurationEntity);

        const response = await appClient
          .request(currentUser)
          // When
          .get(
            `/api/v1/configurations/github/${repositoryVcsId}/${configurationId}/environments/${environmentId}/environment-accesses`,
          )
          // Then
          .expect(200);
        expect(response.body.environmentAccesses).toBeDefined();
        expect(response.body.environmentAccesses.length).toEqual(3);
        const environmentAccessesVerification =
          response.body.environmentAccesses.map(
            (environmentAccess: EnvironmentAccessDTO) =>
              `${environmentAccess.userVcsId} - ${environmentAccess.environmentAccessRole}`,
          );
        expect(environmentAccessesVerification).toContain(
          '16590657 - readSecret',
        );
        expect(environmentAccessesVerification).toContain('22441392 - write');
        expect(environmentAccessesVerification).toContain(
          '102222086 - readNonSecret',
        );
      });
    });
  });
});
