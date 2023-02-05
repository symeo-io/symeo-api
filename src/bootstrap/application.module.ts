import { Module } from '@nestjs/common';
import { ConfigurationController } from 'src/application/controller/configuration.controller';
import { DomainModule } from 'src/bootstrap/domain.module';
import { AuthenticationModule } from 'src/bootstrap/authentication.module';
import { OrganizationController } from '../application/controller/organization.controller';
import { RepositoryController } from 'src/application/controller/repository.controller';
import { CoreModule } from 'src/bootstrap/core.module';

@Module({
  imports: [DomainModule, AuthenticationModule, CoreModule],
  controllers: [
    ConfigurationController,
    OrganizationController,
    RepositoryController,
  ],
})
export class ApplicationModule {}
