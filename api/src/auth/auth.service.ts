import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtSecretRequestType, JwtService } from '@nestjs/jwt';
import jwt from 'jsonwebtoken';
import { MailerService } from 'src/mailer/mailer.service';
import { RedisService } from 'src/redis/redis.service';
import { UsersService } from 'src/users/users.service';
import { generateKeyPairSync } from 'crypto';
import { UserEntity } from 'src/users/user.entity';
import { UserDocument } from 'src/users/user.schema';

@Injectable()
export class AuthService {
  config: Record<string, any>;
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private mailerService: MailerService,
    private redisService: RedisService,
    private jwtService: JwtService,
  ) {
    this.config = this.configService.get('auth');
    if (!this.config.keyEncodingPassphrase?.length) {
      throw new Error('Missing AUTH_SECRET env variable');
    }
  }

  async sendPasswordlessOneTimeCode(usernameOrEmail: string): Promise<any> {
    let user: UserEntity | UserDocument =
      await this.usersService.findByUsernameOrEmail(usernameOrEmail);

    if (user) {
      user = new UserEntity(user.toObject());
      // TODO: extract creation of code and sending the email to an async task queue (e.g. bull) to avoid blocking the customer-facing API
      const oneTimeCode = this.generateOneTimeCode();
      await this.redisService.addOneTimeCodeToUser(user.id, oneTimeCode);
      const url = encodeURI(
        `${this.configService.get('frontendUrl')}/login?id=${
          user.id
        }&code=${oneTimeCode}`,
      );
      await this.mailerService.sendPasswordlessOneTimeCodeMail(
        user.email,
        oneTimeCode,
        url,
      );
      return user.id;
    }
    return null;
  }

  async validateUserWithOneTimeCode(userId: string, code: string) {
    const oneTimeCode = await this.redisService.getOneTimeCodeForUser(userId);
    if (oneTimeCode === code) {
      await this.redisService.deleteOneTimeCodeForUser(userId);
      return await this.usersService.findOne(userId);
    }
    return null;
  }

  async login(user: any) {
    let keyPair = await this.redisService.getKeyPairForUser(user.id, true);

    // We're extending the expiration time of the key pair here on each login, but the actual expiration of each access/refresh token is signed inside the JWT.
    // The key pair expiration is used as a fallback.
    if (!keyPair.privateKey) {
      keyPair = this.generateKeyPair();
      await this.redisService.addKeyPairToUser(user.id, keyPair);
    }

    const {
      accessTokenExpiration,
      refreshTokenExpiration,
      keyEncodingPassphrase,
    } = this.config;
    return {
      access_token: this.jwtService.sign(accessTokenPayload(user), {
        privateKey: {
          key: keyPair.privateKey,
          passphrase: keyEncodingPassphrase,
        } as any, // Can remove casting to any once this PR is merged: https://github.com/nestjs/jwt/pull/1192
        expiresIn: accessTokenExpiration,
      }),
      refresh_token: this.jwtService.sign(
        { sub: user.id },
        {
          privateKey: {
            key: keyPair.privateKey,
            passphrase: keyEncodingPassphrase,
          } as any,
          expiresIn: refreshTokenExpiration,
        },
      ),
    };
  }

  async refreshToken(userId: any) {
    const keyPair = await this.redisService.getKeyPairForUser(userId);

    if (!keyPair) {
      throw new HttpException(
        'Session Expired, Please Re-login.',
        HttpStatus.UNAUTHORIZED,
      ); // Should not happen since the jwt refresh token has the same expiration, but just in case
    }

    const { accessTokenExpiration, keyEncodingPassphrase } = this.config;
    const user = await this.usersService.findOne(userId);

    return {
      access_token: this.jwtService.sign(accessTokenPayload(user), {
        privateKey: {
          key: keyPair.privateKey,
          passphrase: keyEncodingPassphrase,
        } as any,
        expiresIn: accessTokenExpiration,
      }),
    };
  }

  generateKeyPair() {
    return generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: this.config.keyEncodingPassphrase,
      },
    });
  }

  generateOneTimeCode() {
    return Math.random().toString(36).slice(-6);
  }
}

const accessTokenPayload = (user: any) => ({
  sub: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
});
