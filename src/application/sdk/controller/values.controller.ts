import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { ValuesFacade } from 'src/domain/port/in/values.facade';
import {
  ApiKeyGuard,
  RequestWithEnvironmentId,
} from 'src/application/sdk/authentication/api-key.guard';
import { GetValuesResponseDTO } from 'src/application/sdk/dto/get-values.response.dto';
import { ApiTags } from '@nestjs/swagger';
import AnalyticsPort from 'src/domain/port/out/analytics.port';

@Controller('values')
@ApiTags('values')
@UseGuards(ApiKeyGuard)
export class ValuesController {
  constructor(
    @Inject('ValuesFacade')
    private readonly valuesFacade: ValuesFacade,
    @Inject('AnalyticsAdapter')
    private readonly analyticsPort: AnalyticsPort,
  ) {}

  @Get()
  async getEnvironmentValuesForSdk(
    @Req() { environmentId }: RequestWithEnvironmentId,
  ): Promise<GetValuesResponseDTO> {
    this.analyticsPort.valuesReadBySdk(environmentId);
    const values = await this.valuesFacade.findByEnvironmentForSdk(
      environmentId,
    );

    return new GetValuesResponseDTO(values);
  }
}
