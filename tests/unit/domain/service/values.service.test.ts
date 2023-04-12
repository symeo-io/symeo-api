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
import { ConfigurationContract } from 'src/domain/model/configuration/configuration-contract.model';
import { EnvironmentPermissionFacade } from 'src/domain/port/in/environment-permission.facade.port';
import EnvironmentAuditService from 'src/domain/service/environment-audit.service';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';

describe('ValuesService', () => {
  const mockedSecretValuesStoragePort: SecretValuesStoragePort =
    mock<SecretValuesStoragePort>();

  const mockedConfigurationFacade: ConfigurationFacade =
    mock<ConfigurationFacade>();

  const mockedEnvironmentPermissionFacade: EnvironmentPermissionFacade =
    mock<EnvironmentPermissionFacade>();

  const mockedEnvironmentAuditService: EnvironmentAuditService = mock(
    EnvironmentAuditService,
  );

  const valuesService: ValuesService = new ValuesService(
    mockedSecretValuesStoragePort,
    mockedConfigurationFacade,
    mockedEnvironmentPermissionFacade,
    mockedEnvironmentAuditService,
  );

  const mockedDefaultBranchContract: ConfigurationContract = {
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

  const mockedSelectedBranchContract: ConfigurationContract = {
    aws: {
      region: {
        type: 'string',
      },
      user: {
        type: 'string',
        secret: true,
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

  const repository: VcsRepository = {
    id: faker.datatype.number(),
    name: faker.name.firstName(),
    owner: {
      id: faker.datatype.number(),
      name: faker.name.firstName(),
      avatarUrl: faker.datatype.string(),
    },
    vcsType: VCSProvider.GitHub,
    vcsUrl: faker.datatype.string(),
    defaultBranch: faker.lorem.slug(),
    isCurrentUserAdmin: false,
  };

  const branchName = faker.name.firstName();
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
    { name: repository.name, vcsId: repository.id },
    { name: repository.owner.name, vcsId: repository.owner.id },
    faker.datatype.string(),
    branchName,
    [environment],
  );

  describe('getHiddenValuesByEnvironmentForWebapp', () => {
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
        .spyOn(mockedSecretValuesStoragePort, 'getValuesForEnvironmentId')
        .mockImplementation(() => Promise.resolve(mockedConfigurationValues));
      jest
        .spyOn(mockedConfigurationFacade, 'findContract')
        .mockImplementationOnce(() =>
          Promise.resolve(mockedDefaultBranchContract),
        );
      jest
        .spyOn(mockedConfigurationFacade, 'findContract')
        .mockImplementationOnce(() =>
          Promise.resolve(mockedDefaultBranchContract),
        );

      const hiddenConfigurationValues: ConfigurationValues =
        await valuesService.getHiddenValuesByEnvironmentForWebapp(
          currentUser,
          repository,
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
        .spyOn(mockedSecretValuesStoragePort, 'getValuesForEnvironmentId')
        .mockImplementation(() => Promise.resolve(mockedConfigurationValues));
      jest
        .spyOn(mockedConfigurationFacade, 'findContract')
        .mockImplementationOnce(() =>
          Promise.resolve(mockedDefaultBranchContract),
        );
      jest
        .spyOn(mockedConfigurationFacade, 'findContract')
        .mockImplementationOnce(() =>
          Promise.resolve(mockedDefaultBranchContract),
        );

      const hiddenConfigurationValues: ConfigurationValues =
        await valuesService.getHiddenValuesByEnvironmentForWebapp(
          currentUser,
          repository,
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

    it('should return hidden configuration values for contract partially filled with values and selected contract different from default branch', async () => {
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
        .spyOn(mockedSecretValuesStoragePort, 'getValuesForEnvironmentId')
        .mockImplementation(() => Promise.resolve(mockedConfigurationValues));
      jest
        .spyOn(mockedConfigurationFacade, 'findContract')
        .mockImplementationOnce(() =>
          Promise.resolve(mockedDefaultBranchContract),
        );
      jest
        .spyOn(mockedConfigurationFacade, 'findContract')
        .mockImplementationOnce(() =>
          Promise.resolve(mockedSelectedBranchContract),
        );

      const hiddenConfigurationValues: ConfigurationValues =
        await valuesService.getHiddenValuesByEnvironmentForWebapp(
          currentUser,
          repository,
          configuration,
          branchName,
          environment,
        );

      // Then
      expect(hiddenConfigurationValues).toEqual({
        aws: {
          region: '*********',
          user: '*********',
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

  describe('updateValuesByEnvironmentForWebapp', () => {
    it('should update configuration values with partial requested values', async () => {
      const mockedPersistedValues: ConfigurationValues = {
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

      const requestedValues: ConfigurationValues = {
        aws: {
          user: 'new-fake-user',
        },
        database: {
          postgres: {
            port: 1111,
          },
        },
      };

      // When
      jest
        .spyOn(mockedSecretValuesStoragePort, 'getValuesForEnvironmentId')
        .mockImplementation(() => Promise.resolve(mockedPersistedValues));
      const spySetValuesForEnvironment = jest.spyOn(
        mockedSecretValuesStoragePort,
        'setValuesForEnvironment',
      );
      const spySaveWithValuesMetadataType = jest.spyOn(
        mockedEnvironmentAuditService,
        'saveWithValuesMetadataType',
      );

      await valuesService.updateValuesByEnvironmentForWebapp(
        currentUser,
        repository,
        configuration,
        environment,
        requestedValues,
      );

      const expectedUpdatedValues: ConfigurationValues = {
        aws: {
          region: 'eu-west-3',
          user: 'new-fake-user',
        },
        database: {
          postgres: {
            host: 'fake-host',
            port: 1111,
          },
        },
      };

      // Then
      expect(spySetValuesForEnvironment).toBeCalledTimes(1);
      expect(spySetValuesForEnvironment).toBeCalledWith(
        environment,
        expectedUpdatedValues,
      );
      expect(spySaveWithValuesMetadataType).toBeCalledTimes(1);
      expect(spySaveWithValuesMetadataType).toBeCalledWith(
        EnvironmentAuditEventType.VALUES_UPDATED,
        currentUser,
        repository,
        environment,
        {
          environmentName: environment.name,
          updatedProperties: ['aws.user', 'database.postgres.port'],
        },
      );
    });
  });
});
