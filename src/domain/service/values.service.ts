import { ValuesFacade } from 'src/domain/port/in/values.facade';
import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { SecretValuesStoragePort } from 'src/domain/port/out/secret-values.storage.port';
import Environment from 'src/domain/model/environment/environment.model';
import User from 'src/domain/model/user/user.model';
import Configuration from 'src/domain/model/configuration/configuration.model';
import {
  ConfigurationContract,
  ConfigurationContractProperty,
} from 'src/domain/model/configuration/configuration-contract.model';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { EnvironmentPermissionStoragePort } from 'src/domain/port/out/environment-permission.storage.port';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import { EnvironmentPermissionUtils } from 'src/domain/utils/environment-permission.utils';

export class ValuesService implements ValuesFacade {
  constructor(
    private readonly secretValuesStoragePort: SecretValuesStoragePort,
    private configurationFacade: ConfigurationFacade,
    private environmentPermissionStoragePort: EnvironmentPermissionStoragePort,
    private githubAdapterPort: GithubAdapterPort,
    private environmentPermissionUtils: EnvironmentPermissionUtils,
  ) {}

  async findByEnvironmentForSdk(
    environmentId: string,
  ): Promise<ConfigurationValues> {
    return await this.secretValuesStoragePort.getValuesForEnvironmentId(
      environmentId,
    );
  }

  async findByEnvironmentForWebapp(
    user: User,
    repository: VcsRepository,
    configuration: Configuration,
    branchName: string | undefined,
    environment: Environment,
  ): Promise<ConfigurationValues> {
    const userVcsId = parseInt(user.id.split('|')[1]);
    let currentUserPermissionRole: EnvironmentPermissionRole;
    const inBaseEnvironmentPermissions: EnvironmentPermission | undefined =
      await this.environmentPermissionStoragePort.findForEnvironmentIdAndVcsUserId(
        environment.id,
        userVcsId,
      );
    if (inBaseEnvironmentPermissions) {
      currentUserPermissionRole =
        inBaseEnvironmentPermissions.environmentPermissionRole;
    } else {
      const githubRepositoryUsers: VcsUser[] =
        await this.githubAdapterPort.getCollaboratorsForRepository(
          user,
          repository.owner.name,
          repository.name,
        );

      const githubVcsUser: VcsUser | undefined = githubRepositoryUsers.find(
        (vcsUser) => vcsUser.id === userVcsId,
      );

      if (!githubVcsUser) {
        throw new SymeoException(
          `User with vcsId ${userVcsId} do not have access to repository with vcsRepositoryId ${repository.id}`,
          SymeoExceptionCode.REPOSITORY_NOT_FOUND,
        );
      }

      currentUserPermissionRole =
        this.environmentPermissionUtils.mapGithubRoleToDefaultEnvironmentPermission(
          githubVcsUser.vcsRepositoryRole,
        );
    }

    const configurationValues: ConfigurationValues =
      await this.secretValuesStoragePort.getValuesForEnvironmentId(
        environment.id,
      );

    if (
      currentUserPermissionRole === EnvironmentPermissionRole.READ_NON_SECRET
    ) {
      const configurationContract: ConfigurationContract =
        await this.configurationFacade.findContract(
          user,
          configuration,
          branchName,
        );

      const emptyConfigurationValues = new ConfigurationValues();

      const hiddenConfigurationValues =
        this.parseContractAndValuesToHideSecrets(
          emptyConfigurationValues,
          configurationContract,
          configurationValues,
        );
      return hiddenConfigurationValues;
    }

    return configurationValues;
  }

  public parseContractAndValuesToHideSecrets(
    emptyConfigurationValues: ConfigurationValues,
    configurationContract: ConfigurationContract,
    configurationValues: ConfigurationValues,
  ): ConfigurationValues {
    Object.keys(configurationContract).forEach((propertyName) => {
      const contractProperty = configurationContract[propertyName];
      const valuesProperty = configurationValues[propertyName];

      if (valuesProperty) {
        if (!this.isConfigProperty(contractProperty)) {
          emptyConfigurationValues[propertyName] =
            this.parseContractAndValuesToHideSecrets(
              new ConfigurationValues(),
              contractProperty as ConfigurationContract,
              valuesProperty as ConfigurationValues,
            );
        } else {
          if (this.isContractPropertySecret(contractProperty)) {
            emptyConfigurationValues[propertyName] = this.generateHiddenSecret(
              valuesProperty as string | number | boolean,
            );
          } else {
            emptyConfigurationValues[propertyName] = valuesProperty;
          }
        }
      }
    });

    return emptyConfigurationValues;
  }

  private generateHiddenSecret(valuesProperty: string | number | boolean) {
    return '*'.repeat(valuesProperty.toString().length);
  }

  private isContractPropertySecret(
    contractProperty: ConfigurationContract | ConfigurationContractProperty,
  ) {
    return contractProperty.secret === true;
  }

  private isConfigProperty(
    contractProperty: ConfigurationContract | ConfigurationContractProperty,
  ) {
    return contractProperty.type && typeof contractProperty.type === 'string';
  }

  async updateByEnvironment(
    environment: Environment,
    values: ConfigurationValues,
  ): Promise<void> {
    return await this.secretValuesStoragePort.setValuesForEnvironment(
      environment,
      values,
    );
  }
}
