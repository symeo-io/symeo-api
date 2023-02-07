import { Module } from '@nestjs/common';
import { ConfigurationController } from 'src/application/controller/configuration.controller';
import { DomainModule } from 'src/bootstrap/domain.module';
import { AuthenticationModule } from 'src/bootstrap/authentication.module';
import { OrganizationController } from '../application/controller/organization.controller';
import { RepositoryController } from 'src/application/controller/repository.controller';
import { ValuesController } from 'src/application/controller/values.controller';
import { EnvironmentController } from 'src/application/controller/environment.controller';
import { ApiKeyController } from 'src/application/controller/api-key.controller';

@Module({
  imports: [DomainModule, AuthenticationModule],
  controllers: [
    ConfigurationController,
    OrganizationController,
    RepositoryController,
    ValuesController,
    EnvironmentController,
    ApiKeyController,
  ],
})
export class ApplicationModule {}
