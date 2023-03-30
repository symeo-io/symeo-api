import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { CreateGitHubConfigurationDTO } from 'src/application/webapp/dto/configuration/create-github-configuration.dto';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import User from 'src/domain/model/user/user.model';
import { GetConfigurationResponseDTO } from 'src/application/webapp/dto/configuration/get-configuration.response.dto';
import { GetConfigurationsResponseDTO } from 'src/application/webapp/dto/configuration/get-configurations.response.dto';
import { ValidateCreateGithubConfigurationParametersDTO } from 'src/application/webapp/dto/configuration/validate-create-github-configuration-parameters.dto';
import { ValidateCreateConfigurationParametersResponseDTO } from 'src/application/webapp/dto/configuration/validate-create-configuration-parameters.response.dto';
import { CreateConfigurationResponseDTO } from 'src/application/webapp/dto/configuration/create-configuration.response.dto';
import { GetConfigurationContractResponseDTO } from 'src/application/webapp/dto/contract/get-configuration-contract.response.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdateGitHubConfigurationDTO } from 'src/application/webapp/dto/configuration/update-github-configuration.dto';
import { UpdateConfigurationResponseDTO } from 'src/application/webapp/dto/configuration/update-configuration.response.dto';
import { ConfigurationAuthorizationGuard } from 'src/application/webapp/authorization/ConfigurationAuthorizationGuard';
import { RequestedConfiguration } from 'src/application/webapp/decorator/requested-configuration.decorator';
import Configuration from 'src/domain/model/configuration/configuration.model';
import { RepositoryAuthorizationGuard } from 'src/application/webapp/authorization/RepositoryAuthorizationGuard';
import { RequestedRepository } from 'src/application/webapp/decorator/requested-repository.decorator';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { RequiredRepositoryRole } from 'src/application/webapp/decorator/repository-role.decorator';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';

@Controller('configurations')
@ApiTags('configurations')
@UseGuards(AuthGuard('jwt'))
export class ConfigurationController {
  constructor(
    @Inject('ConfigurationFacade')
    private readonly configurationFacade: ConfigurationFacade,
  ) {}

  @ApiOkResponse({
    description: 'Creation of Github configuration parameters validated',
    type: ValidateCreateConfigurationParametersResponseDTO,
  })
  @Post('validate')
  @HttpCode(200)
  async validateConfigurationCreationParameters(
    @Body()
    validateCreateGithubConfigurationParametersDTO: ValidateCreateGithubConfigurationParametersDTO,
    @CurrentUser() user: User,
  ): Promise<ValidateCreateConfigurationParametersResponseDTO> {
    return await this.configurationFacade.validateCreateForUser(
      user,
      validateCreateGithubConfigurationParametersDTO.repositoryVcsId,
      validateCreateGithubConfigurationParametersDTO.contractFilePath,
      validateCreateGithubConfigurationParametersDTO.branch,
    );
  }

  @ApiOkResponse({
    description: 'Github configuration successfully retrieved',
    type: GetConfigurationResponseDTO,
  })
  @Get(':repositoryVcsId/:configurationId')
  @UseGuards(ConfigurationAuthorizationGuard)
  async getConfigurationById(
    @RequestedRepository() repository: VcsRepository,
    @RequestedConfiguration() configuration: Configuration,
    @CurrentUser() user: User,
  ): Promise<GetConfigurationResponseDTO> {
    const environmentsPermissions =
      await this.configurationFacade.findUserEnvironmentsPermissions(
        user,
        repository,
        configuration,
      );
    return GetConfigurationResponseDTO.fromDomain(
      repository,
      configuration,
      environmentsPermissions,
    );
  }

  @ApiOkResponse({
    description: 'Github configuration contract successfully retrieved',
    type: GetConfigurationContractResponseDTO,
  })
  @Get(':repositoryVcsId/:configurationId/contract')
  @UseGuards(ConfigurationAuthorizationGuard)
  @ApiQuery({ name: 'branch', required: false })
  async getConfigurationContractById(
    @RequestedConfiguration() configuration: Configuration,
    @Query('branch') branch: string | undefined,
    @CurrentUser() user: User,
  ): Promise<GetConfigurationContractResponseDTO> {
    const contract = await this.configurationFacade.findContract(
      user,
      configuration,
      branch,
    );

    return new GetConfigurationContractResponseDTO(contract);
  }

  @ApiOkResponse({
    description:
      'Github configurations for repositoryId successfully retrieved',
    type: GetConfigurationsResponseDTO,
  })
  @Get(':repositoryVcsId')
  @UseGuards(RepositoryAuthorizationGuard)
  async getConfigurationsForRepositoryId(
    @RequestedRepository() repository: VcsRepository,
  ): Promise<GetConfigurationsResponseDTO> {
    const configuration = await this.configurationFacade.findAllForRepository(
      repository,
    );

    return GetConfigurationsResponseDTO.fromDomains(repository, configuration);
  }

  @ApiOkResponse({
    description: 'Github configuration successfully deleted',
  })
  @Delete(':repositoryVcsId/:configurationId')
  @UseGuards(ConfigurationAuthorizationGuard)
  @RequiredRepositoryRole(VcsRepositoryRole.ADMIN)
  async deleteConfigurationById(
    @CurrentUser() currentUser: User,
    @RequestedRepository() repository: VcsRepository,
    @RequestedConfiguration() configuration: Configuration,
  ): Promise<void> {
    await this.configurationFacade.delete(
      currentUser,
      repository,
      configuration,
    );
  }

  @ApiOkResponse({
    description: 'Github configuration successfully created',
    type: CreateConfigurationResponseDTO,
  })
  @Post(':repositoryVcsId')
  @UseGuards(RepositoryAuthorizationGuard)
  @RequiredRepositoryRole(VcsRepositoryRole.ADMIN)
  async createConfiguration(
    @RequestedRepository() repository: VcsRepository,
    @CurrentUser() user: User,
    @Body() createConfigurationDTO: CreateGitHubConfigurationDTO,
  ): Promise<CreateConfigurationResponseDTO> {
    const configuration = await this.configurationFacade.createForRepository(
      user,
      repository,
      createConfigurationDTO.name,
      createConfigurationDTO.contractFilePath,
      createConfigurationDTO.branch,
    );

    return CreateConfigurationResponseDTO.fromDomain(configuration);
  }

  @ApiOkResponse({
    description: 'Github configuration successfully updated',
    type: UpdateConfigurationResponseDTO,
  })
  @Patch(':repositoryVcsId/:configurationId')
  @UseGuards(ConfigurationAuthorizationGuard)
  @RequiredRepositoryRole(VcsRepositoryRole.ADMIN)
  async updateConfiguration(
    @CurrentUser() currentUser: User,
    @RequestedRepository() repository: VcsRepository,
    @RequestedConfiguration() configuration: Configuration,
    @Body() updateConfigurationDTO: UpdateGitHubConfigurationDTO,
  ): Promise<UpdateConfigurationResponseDTO> {
    const updatedConfiguration = await this.configurationFacade.update(
      currentUser,
      repository,
      configuration,
      updateConfigurationDTO.name,
      updateConfigurationDTO.contractFilePath,
      updateConfigurationDTO.branch,
    );

    return UpdateConfigurationResponseDTO.fromDomain(updatedConfiguration);
  }
}
