import { Module } from '@nestjs/common';
import { ConfigurationController } from 'src/application/controller/configuration.controller';
import { DomainModule } from 'src/bootstrap/domain.module';
import { AuthenticationModule } from 'src/bootstrap/authentication.module';
import { OrganizationController } from '../application/controller/organization.controller';

@Module({
  imports: [DomainModule, AuthenticationModule],
  controllers: [ConfigurationController, OrganizationController],
})
export class ApplicationModule {}
