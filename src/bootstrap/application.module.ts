import { Module } from '@nestjs/common';
import { ConfigurationController } from 'src/application/controller/configuration.controller';
import { DomainModule } from 'src/bootstrap/domain.module';
import { AuthenticationModule } from 'src/bootstrap/authentication.module';
import { Auth0AdapterModule } from 'src/bootstrap/auth0-adapter.module';
import { RepositoryController } from '../application/controller/repository.controller';
import { OrganizationController } from '../application/controller/organization.controller';

@Module({
  imports: [DomainModule, AuthenticationModule, Auth0AdapterModule],
  controllers: [
    ConfigurationController,
    RepositoryController,
    OrganizationController,
  ],
})
export class ApplicationModule {}
