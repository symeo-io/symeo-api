import AnalyticsPort from 'src/domain/port/out/analytics.port';
import { Repository } from 'typeorm';
import EnvironmentEntity from 'src/infrastructure/postgres-adapter/entity/environment.entity';
import SdkValuesReadAnalyticsEntity from 'src/infrastructure/postgres-adapter/entity/analytics/sdk-values-read.analytics.entity';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';

export default class AnalyticsAdapter implements AnalyticsPort {
  constructor(
    private environmentRepository: Repository<EnvironmentEntity>,
    private configurationRepository: Repository<ConfigurationEntity>,
    private sdkValuesReadAnalyticsRepository: Repository<SdkValuesReadAnalyticsEntity>,
  ) {}

  async valuesReadBySdk(environmentId: string): Promise<void> {
    const environment = await this.environmentRepository.findOneBy({
      id: environmentId,
    });

    if (!environment) {
      return;
    }

    const configuration = await this.configurationRepository.findOneBy({
      id: environment.configurationId,
    });

    if (!configuration) {
      return;
    }

    await this.sdkValuesReadAnalyticsRepository.save(
      SdkValuesReadAnalyticsEntity.fromEnvironmentEntity(
        environment,
        configuration,
      ),
    );
  }
}
