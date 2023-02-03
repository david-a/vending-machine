import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Redirect,
  Res,
  SerializeOptions,
} from '@nestjs/common';
import { AppService } from './app.service';
import { BuyDto } from './app/dto/buy.dto';
import { DepositDto } from './app/dto/deposit.dto';
import { AppGuard } from './auth/guards/app.guard';
import { Roles } from './shared/decorators/roles.decorator';
import { RequesterContext } from './shared/enums/requester-context';
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
  @Get('/user')
  async user(@Request() req, @Res() res) {
    res.status(302).redirect('/users/' + req.user.id);
  }

  // NOTE: `deposit` and `reset` may fit better inside the `users.controller` but we wanted them to be at root level.
  @UseGuards(AppGuard)
  @Roles(Role.Buyer)
  @SerializeOptions({
    groups: [RequesterContext.Self],
  })
  @Post('deposit')
  async deposit(@Body() depositDto: DepositDto, @Request() req) {
    const result = await this.usersService.deposit(req.user.id, depositDto);
    return new UserEntity(result.toObject());
  }

  @UseGuards(AppGuard)
  @Roles(Role.Buyer)
  @Post('reset')
  async reset(@Request() req) {
    const result = await this.usersService.reset(req.user.id);
    return {
      change: result.deposit,
    };
  }

  // NOTE: could also be implemented as a `buy/:id` or even inside `products.controller` as `products/:id/buy`, but we may want to support multiple products at once in the future.
  @UseGuards(AppGuard)
  @Roles(Role.Buyer)
  @Post('buy')
  async buy(@Body() buyDto: BuyDto, @Request() req) {
    // TODO: enable buying multiple product types
    return await this.appService.buy(req.user.id, buyDto);
  }
}
