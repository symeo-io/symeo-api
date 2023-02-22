import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from 'src/application/health/controller/health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthApplicationModule {}
