import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Post('oneTimeCode')
  async oneTimeCode(@Request() req) {
    if (!req.body.username) {
      throw new HttpException(
        'Username or email is required.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const userId = await this.authService.sendPasswordlessOneTimeCode(
      req.body.username,
    );
    return {
      userId: userId || this.userService.generateFakeUserId(req.body.username),
    };
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return await this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('refreshToken')
  async refreshToken(@Request() req) {
    return await this.authService.refreshToken(req.user.id);
  }
}
