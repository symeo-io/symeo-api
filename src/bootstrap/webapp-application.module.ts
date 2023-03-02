import { Module } from '@nestjs/common';
import { ConfigurationController } from 'src/application/webapp/controller/configuration.controller';
import { DomainModule } from 'src/bootstrap/domain.module';
import { WebappAuthenticationModule } from 'src/bootstrap/webapp-authentication.module';
import { OrganizationController } from '../application/webapp/controller/organization.controller';
import { RepositoryController } from 'src/application/webapp/controller/repository.controller';
import { ValuesController } from 'src/application/webapp/controller/values.controller';
import { EnvironmentController } from 'src/application/webapp/controller/environment.controller';
import { ApiKeyController } from 'src/application/webapp/controller/api-key.controller';
import { EnvironmentPermissionController } from 'src/application/webapp/controller/environment-permission.controller';

@Module({
  imports: [DomainModule, WebappAuthenticationModule],
  controllers: [
    ConfigurationController,
    OrganizationController,
    RepositoryController,
    ValuesController,
    EnvironmentController,
    ApiKeyController,
    EnvironmentPermissionController,
  ],
})
export class WebappApplicationModule {}
