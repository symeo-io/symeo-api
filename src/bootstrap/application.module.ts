import { Module } from '@nestjs/common';
import { ConfigurationController } from 'src/application/controller/configuration.controller';
import { DomainModule } from 'src/bootstrap/domain.module';

@Module({
  imports: [DomainModule],
  controllers: [ConfigurationController],
})
export class ApplicationModule {}
