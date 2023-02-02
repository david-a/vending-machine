import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
  UseGuards,
  SerializeOptions,
  Request,
  HttpException,
  HttpStatus,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MongoExceptionFilter } from '../shared/filters/mongo-exception.filter';
import { UserEntity } from './user.entity';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { AppGuard } from 'src/auth/guards/app.guard';
import { verifySelfOrAdmin } from './user.utils';

@UseFilters(new MongoExceptionFilter())
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = await this.usersService.create(createUserDto);
    return new UserEntity(user.toObject());
  }

  @UseGuards(AppGuard)
  @SerializeOptions({
    groups: [Role.Admin],
  })
  @Roles(Role.Admin)
  @Get()
  async findAll() {
    return (await this.usersService.findAll()).map(
      (user) => new UserEntity(user.toObject()),
    );
  }

  @UseGuards(AppGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    verifySelfOrAdmin(req.user, id); // Another approach is to just use the req.user.id instead of passing the id as a param but I wanted to enable the admin to view any user's profile
    return new UserEntity((await this.usersService.findOne(id)).toObject());
  }

  @UseGuards(AppGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto, // TODO: enable changing the amount/role by admin
    @Request() req,
  ) {
    verifySelfOrAdmin(req.user, id);
    const result = await this.usersService.update(id, updateUserDto);
    if (!result)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return new UserEntity(result.toObject());
  }

  @UseGuards(AppGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    verifySelfOrAdmin(req.user, id);
    const result = await this.usersService.remove(id);
    return new UserEntity(result.toObject());
  }
}
