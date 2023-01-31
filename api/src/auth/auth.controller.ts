import {
  Body,
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
import { LoginDto } from './dto/login.dto';
import { OneTimeCodeDto } from './dto/one-time-code.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Post('oneTimeCode')
  async oneTimeCode(@Body() oneTimeCodeDto: OneTimeCodeDto) {
    if (!oneTimeCodeDto.username) {
      throw new HttpException(
        'Username or email is required.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const userId = await this.authService.sendPasswordlessOneTimeCode(
      oneTimeCodeDto.username,
    );
    return {
      userId:
        userId || this.userService.generateFakeUserId(oneTimeCodeDto.username),
    };
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Body() _loginDto: LoginDto) {
    return await this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('refreshToken')
  async refreshToken(
    @Request() req,
    @Body() _refreshTokenDto: RefreshTokenDto,
  ) {
    return await this.authService.refreshToken(req.user.id);
  }
}
