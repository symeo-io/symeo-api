import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CurrentUser } from 'src/application/decorator/current-user.decorator';
import User from 'src/domain/model/user.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { GetEnvironmentValuesResponseDto } from 'src/application/dto/get-environment-values.response.dto';
import { ValuesFacade } from 'src/domain/port/in/valuesFacade';

@Controller('configurations')
export class ValuesController {
  constructor(
    @Inject('ValuesFacade')
    private readonly valuesFacade: ValuesFacade,
  ) {}

  @Get('github/:vcsRepositoryId/:id/environments/:environmentId/values')
  async getEnvironmentValues(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('id') id: string,
    @Param('environmentId') environmentId: string,
    @CurrentUser() user: User,
  ): Promise<GetEnvironmentValuesResponseDto> {
    const values = await this.valuesFacade.findByIdForUser(
      user,
      VCSProvider.GitHub,
      parseInt(vcsRepositoryId),
      id,
      environmentId,
    );

    return new GetEnvironmentValuesResponseDto(values);
  }
}
