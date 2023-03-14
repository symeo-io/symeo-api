import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ConfigurationAuthorizationGuard } from 'src/application/webapp/authorization/ConfigurationAuthorizationGuard';
import { RequestedRepository } from 'src/application/webapp/decorator/requested-repository.decorator';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import User from 'src/domain/model/user/user.model';
import { RequestedConfiguration } from 'src/application/webapp/decorator/requested-configuration.decorator';
import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationAudit from 'src/domain/model/audit/configuration-audit/configuration-audit.model';
import { GetConfigurationAuditsResponseDTO } from 'src/application/webapp/dto/audit/get-configuration-audits.response.dto';
import ConfigurationAuditFacade from 'src/domain/port/in/configuration-audit.facade.port';
import { EnvironmentAuthorizationGuard } from 'src/application/webapp/authorization/EnvironmentAuthorizationGuard';
import { RequestedEnvironment } from 'src/application/webapp/decorator/requested-environment.decorator';
import Environment from 'src/domain/model/environment/environment.model';
import { GetEnvironmentAuditsResponseDTO } from 'src/application/webapp/dto/audit/get-environment-audits.response.dto';
import EnvironmentAudit from 'src/domain/model/audit/environment-audit/environment-audit.model';
import EnvironmentAuditFacade from 'src/domain/port/in/environment-audit.facade.port';

@Controller('configurations')
@ApiTags('audits')
@UseGuards(AuthGuard('jwt'))
export class AuditController {
  constructor(
    @Inject('ConfigurationAuditFacade')
    private readonly configurationAuditFacade: ConfigurationAuditFacade,
    @Inject('EnvironmentAuditFacade')
    private readonly environmentAuditFacade: EnvironmentAuditFacade,
  ) {}

  @Get(':repositoryVcsId/:configurationId/audits')
  @UseGuards(ConfigurationAuthorizationGuard)
  @ApiOkResponse({
    description: 'Configuration audits successfully retrieved',
    type: GetConfigurationAuditsResponseDTO,
  })
  async getConfigurationAudits(
    @RequestedConfiguration() configuration: Configuration,
  ): Promise<GetConfigurationAuditsResponseDTO> {
    const configurationAudits: ConfigurationAudit[] =
      await this.configurationAuditFacade.findConfigurationAudits(
        configuration,
      );

    return GetConfigurationAuditsResponseDTO.fromDomains(configurationAudits);
  }

  @Get(':repositoryVcsId/:configurationId/:environmentId/audits')
  @UseGuards(EnvironmentAuthorizationGuard)
  @ApiOkResponse({
    description: 'Environment audits successfully retrieved',
    type: GetEnvironmentAuditsResponseDTO,
  })
  async getEnvironmentAudits(
    @RequestedEnvironment() environment: Environment,
  ): Promise<GetEnvironmentAuditsResponseDTO> {
    const environmentAudits: EnvironmentAudit[] =
      await this.environmentAuditFacade.findEnvironmentAudits(environment);

    return GetEnvironmentAuditsResponseDTO.fromDomains(environmentAudits);
  }
}
