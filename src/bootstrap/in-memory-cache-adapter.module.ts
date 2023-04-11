import { Module } from '@nestjs/common';
import { InMemoryVcsAccessTokenCacheAdapter } from '../infrastructure/in-memory-cache-adapter/adapter/in-memory-vcs-access-token-cache.adapter';

const InMemoryCacheAdapterProvider = {
  provide: 'InMemoryVcsAccessTokenCacheAdapter',
  useClass: InMemoryVcsAccessTokenCacheAdapter,
};

@Module({
  providers: [InMemoryCacheAdapterProvider],
  exports: [InMemoryCacheAdapterProvider],
})
export class InMemoryCacheAdapterModule {}
