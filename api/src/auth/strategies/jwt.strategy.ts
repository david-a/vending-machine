import { ExtractJwt, Strategy } from 'passport-jwt';
import { decode } from 'jsonwebtoken';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { UserEntity } from 'src/users/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private redisService: RedisService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS512'],
      secretOrKeyProvider: async (_request, rawJwtToken, done) => {
        // decode the jwt token to get the user id

        const decodedToken = decode(rawJwtToken);
        if (!decodedToken || !decodedToken?.sub) {
          done('Invalid JWT token', null);
        } else {
          const userId = decodedToken.sub as string;
          const { publicKey } = await this.redisService.getKeyPairForUser(
            userId,
          );
          done(null, publicKey);
        }
      },
    });
  }

  async validate(payload: any) {
    const { sub, username, email, role } = payload;
    return new UserEntity({ _id: sub, username, email, role });
  }
}
