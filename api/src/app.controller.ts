import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AppService } from './app.service';
import { DepositDto } from './app/dto/deposit.dto';
import { AppGuard } from './auth/guards/app.guard';
import { Roles } from './shared/decorators/roles.decorator';
import { Role } from './shared/enums/role.enum';
import { UserEntity } from './users/user.entity';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private usersService: UsersService,
  ) {}

  @UseGuards(AppGuard)
  @Roles(Role.Buyer)
  @Post('deposit')
  async deposit(@Body() depositDto: DepositDto, @Request() req) {
    const result = await this.usersService.deposit(req.user.id, depositDto);
    return new UserEntity(result.toObject());
  }
}
