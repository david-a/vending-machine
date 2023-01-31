import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

const ONE_TIME_CODE_PREFIX = 'one-time-code:';
const PRIVATE_KEY_PREFIX = 'private-key:';
const PUBLIC_KEY_PREFIX = 'public-key:';

@Injectable()
export class RedisService {
  redisConfig: Record<string, any>;
  authConfig: Record<string, any>;
  client: RedisClientType;
  constructor(private configService: ConfigService) {
    this.redisConfig = this.configService.get('redis');
    this.authConfig = this.configService.get('auth');
    if (!this.redisConfig?.url || !this.redisConfig?.password) {
      throw new Error('redis configuration is missing');
    }
    this.client = createClient({
      url: this.redisConfig.url, // TODO: use TLS
      password: this.redisConfig.password,
    });
  }
  async connectClient() {
    await this.client.connect();
  }

  async disconnectClient() {
    await this.client.disconnect();
  }

  async addOneTimeCodeToUser(userId: string, code: string) {
    return await this.client.setEx(
      ONE_TIME_CODE_PREFIX + userId,
      this.authConfig.oneTimeCodeExpiration,
      code,
    );
  }

  async getOneTimeCodeForUser(userId: string) {
    return await this.client.get(ONE_TIME_CODE_PREFIX + userId);
  }

  async deleteOneTimeCodeForUser(userId: string) {
    return await this.client.del(ONE_TIME_CODE_PREFIX + userId);
  }

  // This Key pair is used to sign and verify the JWT access and refresh token.
  async addKeyPairToUser(
    userId: string,
    keyPair: { publicKey: string; privateKey: string },
  ) {
    return await this.client
      .multi()
      .setEx(
        PUBLIC_KEY_PREFIX + userId,
        this.authConfig.refreshTokenExpiration,
        keyPair.publicKey,
      )
      .setEx(
        PRIVATE_KEY_PREFIX + userId,
        this.authConfig.refreshTokenExpiration,
        keyPair.privateKey,
      )
      .exec();
  }

  async getKeyPairForUser(userId: string, extendExpiration = false) {
    const [publicKey, privateKey] = extendExpiration
      ? await this.client
          .multi()
          .getEx(PUBLIC_KEY_PREFIX + userId, {
            EX: this.authConfig.refreshTokenExpiration,
          })
          .getEx(PRIVATE_KEY_PREFIX + userId, {
            EX: this.authConfig.refreshTokenExpiration,
          })
          .exec()
      : await this.client
          .multi()
          .get(PUBLIC_KEY_PREFIX + userId)
          .get(PRIVATE_KEY_PREFIX + userId)
          .exec();
    return { publicKey, privateKey } as {
      publicKey: string;
      privateKey: string;
    };
  }

  async deleteKeyPairFromUser(userId: any) {
    return await this.client
      .multi()
      .del(PUBLIC_KEY_PREFIX + userId)
      .del(PRIVATE_KEY_PREFIX + userId)
      .exec();
  }
}
