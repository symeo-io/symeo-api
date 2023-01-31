import { Module } from '@nestjs/common';
import { ConfigurationController } from 'src/application/controller/configuration.controller';
import { DomainModule } from 'src/bootstrap/domain.module';
import { AuthenticationModule } from 'src/bootstrap/authentication.module';

@Module({
  imports: [DomainModule, AuthenticationModule],
  controllers: [ConfigurationController],
})
export class ApplicationModule {}
