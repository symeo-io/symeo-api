import { Module } from '@nestjs/common';
import { DomainModule } from 'src/bootstrap/domain.module';
import { ValuesController } from 'src/application/sdk/controller/values.controller';
import { AnalyticsAdapterModule } from 'src/bootstrap/analytics-adapter.module';

@Module({
  imports: [DomainModule, AnalyticsAdapterModule],
  controllers: [ValuesController],
})
export class SdkApplicationModule {}
