import { Module } from '@nestjs/common';
import { DomainModule } from 'src/bootstrap/domain.module';
import { ValuesController } from 'src/application/sdk/controller/values.controller';

@Module({
  imports: [DomainModule],
  controllers: [ValuesController],
})
export class SdkApplicationModule {}
