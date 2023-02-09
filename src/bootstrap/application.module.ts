import { Module } from '@nestjs/common';
import { WebappApplicationModule } from 'src/bootstrap/webapp-application.module';
import { SdkApplicationModule } from 'src/bootstrap/sdk-application.module';
import { HealthApplicationModule } from 'src/bootstrap/health-application.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    WebappApplicationModule,
    SdkApplicationModule,
    HealthApplicationModule,
    RouterModule.register([
      {
        path: 'api/v1',
        module: WebappApplicationModule,
      },
    ]),
    RouterModule.register([
      {
        path: 'api/v1',
        module: SdkApplicationModule,
      },
    ]),
    RouterModule.register([
      {
        path: '',
        module: HealthApplicationModule,
      },
    ]),
  ],
})
export class ApplicationModule {}
