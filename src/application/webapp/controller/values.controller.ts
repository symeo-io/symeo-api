import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetEnvironmentValuesResponseDTO } from 'src/application/webapp/dto/values/get-environment-values.response.dto';
import { ValuesFacade } from 'src/domain/port/in/values.facade';
import { SetEnvironmentValuesResponseDTO } from 'src/application/webapp/dto/values/set-environment-values.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { EnvironmentAuthorizationGuard } from 'src/application/webapp/authorization/EnvironmentAuthorizationGuard';
import { RequestedEnvironment } from 'src/application/webapp/decorator/requested-environment.decorator';
import Environment from 'src/domain/model/environment/environment.model';

@Controller('configurations')
@ApiTags('values')
@UseGuards(AuthGuard('jwt'))
export class ValuesController {
  constructor(
    @Inject('ValuesFacade')
    private readonly valuesFacade: ValuesFacade,
  ) {}

  @ApiOkResponse({
    description: 'Environment values successfully retrieved',
    type: GetEnvironmentValuesResponseDTO,
  })
  @Get(
    'github/:repositoryVcsId/:configurationId/environments/:environmentId/values',
  )
  @UseGuards(EnvironmentAuthorizationGuard)
  async getEnvironmentValues(
    @RequestedEnvironment() environment: Environment,
  ): Promise<GetEnvironmentValuesResponseDTO> {
    const values = await this.valuesFacade.findByEnvironmentId(environment.id);

    return new GetEnvironmentValuesResponseDTO(values);
  }

  @ApiOkResponse({
    description: 'Environment values successfully created',
  })
  @Post(
    'github/:repositoryVcsId/:configurationId/environments/:environmentId/values',
  )
  @UseGuards(EnvironmentAuthorizationGuard)
  @HttpCode(200)
  async setEnvironmentValues(
    @RequestedEnvironment() environment: Environment,
    @Body() setEnvironmentValuesResponseDTO: SetEnvironmentValuesResponseDTO,
  ): Promise<void> {
    await this.valuesFacade.updateByEnvironment(
      environment,
      setEnvironmentValuesResponseDTO.values,
    );
  }
}
