import { AppClient } from 'tests/utils/app.client';
import { Repository } from 'typeorm';
import SdkValuesReadAnalyticsEntity from 'src/infrastructure/postgres-adapter/entity/analytics/sdk-values-read.analytics.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

export class AnalyticsReadValuesTestUtil {
  public repository: Repository<SdkValuesReadAnalyticsEntity>;
  constructor(appClient: AppClient) {
    this.repository = appClient.module.get<
      Repository<SdkValuesReadAnalyticsEntity>
    >(getRepositoryToken(SdkValuesReadAnalyticsEntity));
  }
  public empty() {
    return this.repository.delete({});
  }
}
