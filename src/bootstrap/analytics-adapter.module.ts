import { Repository } from 'typeorm';
import EnvironmentEntity from 'src/infrastructure/postgres-adapter/entity/environment.entity';
import SdkValuesReadAnalyticsEntity from 'src/infrastructure/postgres-adapter/entity/analytics/sdk-values-read.analytics.entity';
import AnalyticsAdapter from 'src/infrastructure/analytics-adapter/adapter/analytics-adapter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PostgresAdapterModule } from 'src/bootstrap/postgres-adapter.module';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';

const AnalyticsAdapterProvider = {
  provide: 'AnalyticsAdapter',
  useFactory: (
    environmentRepository: Repository<EnvironmentEntity>,
    configurationRepository: Repository<ConfigurationEntity>,
    sdkValuesReadAnalyticsRepository: Repository<SdkValuesReadAnalyticsEntity>,
  ) =>
    new AnalyticsAdapter(
      environmentRepository,
      configurationRepository,
      sdkValuesReadAnalyticsRepository,
    ),
  inject: [
    getRepositoryToken(EnvironmentEntity),
    getRepositoryToken(ConfigurationEntity),
    getRepositoryToken(SdkValuesReadAnalyticsEntity),
  ],
};

@Module({
  imports: [PostgresAdapterModule],
  providers: [AnalyticsAdapterProvider],
  exports: [AnalyticsAdapterProvider],
})
export class AnalyticsAdapterModule {}
