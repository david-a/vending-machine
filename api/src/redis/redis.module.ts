import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {
  constructor(private redisService: RedisService) {}
  async onModuleInit(): Promise<void> {
    await this.redisService.connectClient();
  }
  async onModuleDestroy(): Promise<void> {
    await this.redisService.disconnectClient();
  }
}
