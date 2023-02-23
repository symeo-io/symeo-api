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
import EnvironmentPermissionEntity from 'src/infrastructure/postgres-adapter/entity/environment-permission.entity';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { SymeoExceptionCodeToHttpStatusMap } from 'src/application/common/exception/symeo.exception.code.to.http.status.map';
import * as fs from 'fs';
import { EnvironmentPermissionDTO } from 'src/application/webapp/dto/environment-permission/environment-permission.dto';
import EnvironmentEntity from 'src/infrastructure/postgres-adapter/entity/environment.entity';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import SpyInstance = jest.SpyInstance;

describe('EnvironmentPermissionController', () => {
  let appClient: AppClient;
  let environmentPermissionRepository: Repository<EnvironmentPermissionEntity>;
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
    environmentPermissionRepository = appClient.module.get<
      Repository<EnvironmentPermissionEntity>
    >(getRepositoryToken(EnvironmentPermissionEntity));
    configurationRepository = appClient.module.get<
      Repository<ConfigurationEntity>
    >(getRepositoryToken(ConfigurationEntity));
  }, 30000);

  afterAll(() => {
    appClient.close();
  });

  beforeEach(async () => {
    await environmentPermissionRepository.delete({});
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
            `/api/v1/configurations/github/${repositoryVcsId}/${configurationId}/environments/${environmentId}/environment-permissions`,
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
              './tests/utils/stubs/environment-permission/get_environment_permissions_for_owner_and_repo_page_1.json',
            )
            .toString(),
        );
        const mockGithubListCollaboratorsStub2 = JSON.parse(
          fs
            .readFileSync(
              './tests/utils/stubs/environment-permission/get_environment_permissions_for_owner_and_repo_page_2.json',
            )
            .toString(),
        );
        const mockGithubListCollaboratorsStub3 = JSON.parse(
          fs
            .readFileSync(
              './tests/utils/stubs/environment-permission/get_environment_permissions_for_owner_and_repo_page_3.json',
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

        const environmentEntity = new EnvironmentEntity();
        environmentEntity.id = environmentId;
        environmentEntity.name = faker.name.firstName();
        environmentEntity.color = 'blue';
        environmentEntity.environmentPermissions = [];

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
            `/api/v1/configurations/github/${repositoryVcsId}/${configurationId}/environments/${environmentId}/environment-permissions`,
          )
          // Then
          .expect(200);
        expect(response.body.environmentPermissions).toBeDefined();
        expect(response.body.environmentPermissions.length).toEqual(3);
        const environmentPermissionsVerification =
          response.body.environmentPermissions.map(
            (environmentPermission: EnvironmentPermissionDTO) =>
              `${environmentPermission.user.userVcsId} - ${environmentPermission.environmentPermissionRole}`,
          );
        expect(environmentPermissionsVerification).toContain(
          '16590657 - admin',
        );
        expect(environmentPermissionsVerification).toContain(
          '22441392 - admin',
        );
        expect(environmentPermissionsVerification).toContain(
          '102222086 - readNonSecret',
        );
      });

      it('should return 200 with mixed github and inBase environment accesses', async () => {
        // Given

        const environmentPermissionEntity1 = new EnvironmentPermissionEntity();
        environmentPermissionEntity1.id = uuid();
        environmentPermissionEntity1.userVcsId = 16590657;
        environmentPermissionEntity1.environmentPermissionRole =
          EnvironmentPermissionRole.READ_SECRET;

        const environmentPermissionEntity2 = new EnvironmentPermissionEntity();
        environmentPermissionEntity2.id = uuid();
        environmentPermissionEntity2.userVcsId = 22441392;
        environmentPermissionEntity2.environmentPermissionRole =
          EnvironmentPermissionRole.WRITE;

        const environmentEntity = new EnvironmentEntity();
        environmentEntity.id = environmentId;
        environmentEntity.name = faker.name.firstName();
        environmentEntity.color = 'blue';
        environmentEntity.environmentPermissions = [
          environmentPermissionEntity1,
          environmentPermissionEntity2,
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
            `/api/v1/configurations/github/${repositoryVcsId}/${configurationId}/environments/${environmentId}/environment-permissions`,
          )
          // Then
          .expect(200);
        expect(response.body.environmentPermissions).toBeDefined();
        expect(response.body.environmentPermissions.length).toEqual(3);
        const environmentPermissionsVerification =
          response.body.environmentPermissions.map(
            (environmentPermission: EnvironmentPermissionDTO) =>
              `${environmentPermission.user.userVcsId} - ${environmentPermission.environmentPermissionRole}`,
          );
        expect(environmentPermissionsVerification).toContain(
          '16590657 - readSecret',
        );
        expect(environmentPermissionsVerification).toContain(
          '22441392 - write',
        );
        expect(environmentPermissionsVerification).toContain(
          '102222086 - readNonSecret',
        );
      });
    });
  });
});
