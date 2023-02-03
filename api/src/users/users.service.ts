import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { DepositDto } from '../app/dto/deposit.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './user.schema';
@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel({ ...createUserDto, role: 'buyer' });
    return createdUser.save();
  }

  findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  findOne(id: string) {
    return this.userModel.findById(id).exec();
  }

  findByUsernameOrEmail(usernameOrEmail: string) {
    return this.userModel
      .findOne({
        $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
      })
      .exec();
  }

  update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, {
        returnDocument: 'after',
      })
      .exec();
  }

  deposit(id: string, depositDto: DepositDto): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { $inc: { deposit: depositDto.amount } },
        {
          returnDocument: 'after',
        },
      )
      .exec();
  }

  reset(id: string) {
    return this.userModel.findByIdAndUpdate(id, { deposit: 0 }).exec();
  }

  async remove(id: string): Promise<UserDocument> {
    let result: UserDocument;
    const session = await this.userModel.startSession();

    // Another, simpler approach is to just use findOneAndDelete with non-zero deposit,
    // but then we can't distinguish between user not found and user has non-zero deposit.
    await session.withTransaction(async () => {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      // TODO: consider preventing deletion of users with admin/seller role
      if (user['deposit'] !== 0) {
        throw new HttpException(
          'User has a non-zero deposit',
          HttpStatus.BAD_REQUEST,
        );
      }
      result = await user.remove();
    });

    await session.endSession();
    return result;
  }

  // TODO: consider replacing with `new mongoose.Types.ObjectId().toHexString()` and caching for a short period in redis. But prevent abuse.
  generateFakeUserId = (username) => {
    const size = 24;
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = (hash + username.charCodeAt(i)) % 26;
    }
    return Array.from({ length: size }, (_, i) =>
      String.fromCharCode(97 + ((hash + i) % 26)),
    ).join('');
  };
}
