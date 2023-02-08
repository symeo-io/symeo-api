import { Module } from '@nestjs/common';
import { WebappApplicationModule } from 'src/bootstrap/webapp-application.module';
import { SdkApplicationModule } from 'src/bootstrap/sdk-application.module';

@Module({
  imports: [WebappApplicationModule, SdkApplicationModule],
})
export class ApplicationModule {}
