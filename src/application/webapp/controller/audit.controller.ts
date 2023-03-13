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

@Controller('configurations')
@ApiTags('audits')
@UseGuards(AuthGuard('jwt'))
export class AuditController {
  constructor(
    @Inject('ConfigurationAuditFacade')
    private readonly configurationAuditFacade: ConfigurationAuditFacade,
  ) {}

  @Get(':repositoryVcsId/:configurationId/audits')
  @UseGuards(ConfigurationAuthorizationGuard)
  @ApiOkResponse({
    description: 'Configuration audit permissions successfully retrieved',
    type: GetConfigurationAuditsResponseDTO,
  })
  async getConfigurationAudits(
    @CurrentUser() user: User,
    @RequestedRepository() repository: VcsRepository,
    @RequestedConfiguration() configuration: Configuration,
  ): Promise<GetConfigurationAuditsResponseDTO> {
    const configurationAudits: ConfigurationAudit[] =
      await this.configurationAuditFacade.findConfigurationAudits(
        user,
        repository,
        configuration,
      );

    return GetConfigurationAuditsResponseDTO.fromDomains(configurationAudits);
  }
}
