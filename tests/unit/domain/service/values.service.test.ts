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
import { ValuesService } from 'src/domain/service/values.service';
import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { ConfigurationContract } from 'src/domain/model/configuration/configuration-contract.model';
import { EnvironmentPermissionFacade } from 'src/domain/port/in/environment-permission.facade.port';

describe('ValuesService', () => {
  describe('findByEnvironmentForWebapp', () => {
    const mockedSecretValuesStoragePort: SecretValuesStoragePort =
      mock<SecretValuesStoragePort>();

    const mockedConfigurationFacade: ConfigurationFacade =
      mock<ConfigurationFacade>();

    const mockedEnvironmentPermissionFacade: EnvironmentPermissionFacade =
      mock<EnvironmentPermissionFacade>();

    const valuesService: ValuesService = new ValuesService(
      mockedSecretValuesStoragePort,
      mockedConfigurationFacade,
      mockedEnvironmentPermissionFacade,
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
    const currentUser = new User(
      `github|${vcsUserId}`,
      faker.internet.email(),
      faker.name.firstName(),
      VCSProvider.GitHub,
      faker.datatype.number(),
    );

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
            mockedEnvironmentPermissionFacade,
            'getEnvironmentPermissionRole',
          )
          .mockImplementation(() =>
            Promise.resolve(EnvironmentPermissionRole.READ_NON_SECRET),
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
            mockedEnvironmentPermissionFacade,
            'getEnvironmentPermissionRole',
          )
          .mockImplementation(() =>
            Promise.resolve(EnvironmentPermissionRole.READ_NON_SECRET),
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
          mockedEnvironmentPermissionFacade,
          'getEnvironmentPermissionRole',
        )
        .mockImplementation(() =>
          Promise.resolve(EnvironmentPermissionRole.ADMIN),
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
  });
});