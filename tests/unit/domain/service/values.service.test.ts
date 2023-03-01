import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import Configuration from 'src/domain/model/configuration/configuration.model';
import Environment from 'src/domain/model/environment/environment.model';
import { v4 as uuid } from 'uuid';
import { mock } from 'ts-mockito';
import { SecretValuesStoragePort } from 'src/domain/port/out/secret-values.storage.port';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { EnvironmentPermissionStoragePort } from 'src/domain/port/out/environment-permission.storage.port';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import { EnvironmentPermissionUtils } from 'src/domain/utils/environment-permission.utils';
import { ValuesService } from 'src/domain/service/values.service';
import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { ConfigurationContract } from 'src/domain/model/configuration/configuration-contract.model';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';

describe('ValuesService', () => {
  describe('findByEnvironment', () => {
    const mockedSecretValuesStoragePort: SecretValuesStoragePort =
      mock<SecretValuesStoragePort>();

    const mockedConfigurationFacade: ConfigurationFacade =
      mock<ConfigurationFacade>();

    const mockedEnvironmentPermissionStoragePort: EnvironmentPermissionStoragePort =
      mock<EnvironmentPermissionStoragePort>();

    const mockedGithubAdapterPort: GithubAdapterPort =
      mock<GithubAdapterPort>();

    const environmentPermissionUtils = new EnvironmentPermissionUtils();

    const valuesService: ValuesService = new ValuesService(
      mockedSecretValuesStoragePort,
      mockedConfigurationFacade,
      mockedEnvironmentPermissionStoragePort,
      mockedGithubAdapterPort,
      environmentPermissionUtils,
    );

    const mockedConfigurationContract: ConfigurationContract = {
      aws: {
        region: {
          type: 'string',
          secret: true,
        },
        user: {
          type: 'string',
        },
      },
      database: {
        postgres: {
          host: {
            type: 'string',
          },
          port: {
            type: 'integer',
          },
          password: {
            type: 'string',
            secret: true,
          },
          type: {
            type: 'string',
          },
        },
      },
    };

    const vcsUserId = faker.datatype.number({ min: 111111, max: 999999 });
    const currentUser: User = {
      id: `github|${vcsUserId}`,
      email: faker.internet.email(),
      username: faker.name.firstName(),
      provider: VCSProvider.GitHub,
      accessTokenExpiration: faker.datatype.number(),
    };

    const vcsRepository: VcsRepository = {
      id: faker.datatype.number(),
      name: faker.name.firstName(),
      owner: {
        id: faker.datatype.number(),
        name: faker.name.firstName(),
        avatarUrl: faker.datatype.string(),
      },
      vcsType: VCSProvider.GitHub,
      vcsUrl: faker.datatype.string(),
      isCurrentUserAdmin: false,
    };

    const branchName = 'staging';
    const environment: Environment = new Environment(
      uuid(),
      faker.name.firstName(),
      'blue',
      new Date(),
    );

    const configuration: Configuration = new Configuration(
      uuid(),
      faker.name.firstName(),
      VCSProvider.GitHub,
      { name: vcsRepository.name, vcsId: vcsRepository.id },
      { name: vcsRepository.owner.name, vcsId: vcsRepository.owner.id },
      faker.datatype.string(),
      branchName,
      [environment],
    );

    beforeEach(() => {
      jest
        .spyOn(mockedConfigurationFacade, 'findContract')
        .mockImplementation(() => Promise.resolve(mockedConfigurationContract));
    });

    describe('For user with in-base environment permission', () => {
      it('should return hidden configuration values for contract completely filled with values', async () => {
        // Given
        const mockedConfigurationValues: ConfigurationValues = {
          aws: {
            region: 'eu-west-3',
            user: 'fake-user',
          },
          database: {
            postgres: {
              host: 'fake-host',
              port: 9999,
              password: 'password',
              type: 'postgres',
            },
          },
        };

        // When
        jest
          .spyOn(
            mockedEnvironmentPermissionStoragePort,
            'findForEnvironmentIdAndVcsUserId',
          )
          .mockImplementation(() =>
            Promise.resolve(
              new EnvironmentPermission(
                uuid(),
                vcsUserId,
                EnvironmentPermissionRole.READ_NON_SECRET,
                environment.id,
              ),
            ),
          );

        jest
          .spyOn(mockedSecretValuesStoragePort, 'getValuesForEnvironmentId')
          .mockImplementation(() => Promise.resolve(mockedConfigurationValues));

        const hiddenConfigurationValues: ConfigurationValues =
          await valuesService.findByEnvironmentForWebapp(
            currentUser,
            vcsRepository,
            configuration,
            branchName,
            environment,
          );

        // Then
        expect(hiddenConfigurationValues).toEqual({
          aws: {
            region: '*********',
            user: 'fake-user',
          },
          database: {
            postgres: {
              host: 'fake-host',
              port: 9999,
              password: '********',
              type: 'postgres',
            },
          },
        });
      });

      it('should return hidden configuration values for contract partially filled with values', async () => {
        // Given
        const mockedConfigurationValues: ConfigurationValues = {
          aws: {
            region: 'eu-west-3',
            user: 'fake-user',
          },
          database: {
            postgres: {
              host: 'fake-host',
              port: 9999,
            },
          },
        };

        // When
        jest
          .spyOn(
            mockedEnvironmentPermissionStoragePort,
            'findForEnvironmentIdAndVcsUserId',
          )
          .mockImplementation(() =>
            Promise.resolve(
              new EnvironmentPermission(
                uuid(),
                vcsUserId,
                EnvironmentPermissionRole.READ_NON_SECRET,
                environment.id,
              ),
            ),
          );
        jest
          .spyOn(mockedSecretValuesStoragePort, 'getValuesForEnvironmentId')
          .mockImplementation(() => Promise.resolve(mockedConfigurationValues));

        const hiddenConfigurationValues: ConfigurationValues =
          await valuesService.findByEnvironmentForWebapp(
            currentUser,
            vcsRepository,
            configuration,
            branchName,
            environment,
          );

        // Then
        expect(hiddenConfigurationValues).toEqual({
          aws: {
            region: '*********',
            user: 'fake-user',
          },
          database: {
            postgres: {
              host: 'fake-host',
              port: 9999,
            },
          },
        });
      });
    });

    it('should return configurations values without hiding them ', async () => {
      // Given
      const mockedConfigurationValues: ConfigurationValues = {
        aws: {
          region: 'eu-west-3',
          user: 'fake-user',
        },
        database: {
          postgres: {
            host: 'fake-host',
            port: 9999,
            password: 'password',
            type: 'postgres',
          },
        },
      };

      // When
      jest
        .spyOn(
          mockedEnvironmentPermissionStoragePort,
          'findForEnvironmentIdAndVcsUserId',
        )
        .mockImplementation(() =>
          Promise.resolve(
            new EnvironmentPermission(
              uuid(),
              vcsUserId,
              EnvironmentPermissionRole.READ_SECRET,
              environment.id,
            ),
          ),
        );
      jest
        .spyOn(mockedSecretValuesStoragePort, 'getValuesForEnvironmentId')
        .mockImplementation(() => Promise.resolve(mockedConfigurationValues));

      const hiddenConfigurationValues: ConfigurationValues =
        await valuesService.findByEnvironmentForWebapp(
          currentUser,
          vcsRepository,
          configuration,
          branchName,
          environment,
        );

      // Then
      expect(hiddenConfigurationValues).toEqual(mockedConfigurationValues);
    });

    describe('For github user permission', () => {
      const mockedConfigurationValues: ConfigurationValues = {
        aws: {
          region: 'eu-west-3',
          user: 'fake-user',
        },
        database: {
          postgres: {
            host: 'fake-host',
            port: 9999,
            password: 'password',
            type: 'postgres',
          },
        },
      };

      beforeEach(async () => {
        jest
          .spyOn(
            mockedEnvironmentPermissionStoragePort,
            'findForEnvironmentIdAndVcsUserId',
          )
          .mockImplementation(() => Promise.resolve(undefined));
      });

      it('should return configurations values without hiding them', async () => {
        // Given
        jest
          .spyOn(mockedGithubAdapterPort, 'getCollaboratorsForRepository')
          .mockImplementation(() =>
            Promise.resolve([
              new VcsUser(
                vcsUserId,
                faker.name.firstName(),
                faker.datatype.string(),
                VcsRepositoryRole.ADMIN,
              ),
            ]),
          );

        // When
        jest
          .spyOn(mockedSecretValuesStoragePort, 'getValuesForEnvironmentId')
          .mockImplementation(() => Promise.resolve(mockedConfigurationValues));

        const hiddenConfigurationValues: ConfigurationValues =
          await valuesService.findByEnvironmentForWebapp(
            currentUser,
            vcsRepository,
            configuration,
            branchName,
            environment,
          );

        // Then
        expect(hiddenConfigurationValues).toEqual(mockedConfigurationValues);
      });

      it('should return hidden configuration values', async () => {
        // Given
        jest
          .spyOn(mockedGithubAdapterPort, 'getCollaboratorsForRepository')
          .mockImplementation(() =>
            Promise.resolve([
              new VcsUser(
                vcsUserId,
                faker.name.firstName(),
                faker.datatype.string(),
                VcsRepositoryRole.READ,
              ),
            ]),
          );

        // When
        jest
          .spyOn(mockedSecretValuesStoragePort, 'getValuesForEnvironmentId')
          .mockImplementation(() => Promise.resolve(mockedConfigurationValues));

        const hiddenConfigurationValues: ConfigurationValues =
          await valuesService.findByEnvironmentForWebapp(
            currentUser,
            vcsRepository,
            configuration,
            branchName,
            environment,
          );

        // Then
        expect(hiddenConfigurationValues).toEqual({
          aws: {
            region: '*********',
            user: 'fake-user',
          },
          database: {
            postgres: {
              host: 'fake-host',
              port: 9999,
              password: '********',
              type: 'postgres',
            },
          },
        });
      });
    });
  });
});
