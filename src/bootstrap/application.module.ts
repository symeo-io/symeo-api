import { Module } from '@nestjs/common';
import { ConfigurationController } from 'src/application/controller/configuration.controller';
import { DomainModule } from 'src/bootstrap/domain.module';
import { AuthenticationModule } from 'src/bootstrap/authentication.module';
import { OrganizationController } from '../application/controller/organization.controller';
import { RepositoryController } from 'src/application/controller/repository.controller';
import { ValuesController } from 'src/application/controller/values.controller';

@Module({
  imports: [DomainModule, AuthenticationModule],
  controllers: [
    ConfigurationController,
    OrganizationController,
    RepositoryController,
    ValuesController,
  ],
})
export class ApplicationModule {}
