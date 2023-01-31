import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'id', passwordField: 'code' });
  }

  async validate(id: string, code: string): Promise<any> {
    const user = await this.authService.validateUserWithOneTimeCode(id, code);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
