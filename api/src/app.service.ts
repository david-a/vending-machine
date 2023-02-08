import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { instanceToPlain } from 'class-transformer';
import mongoose, { Connection, Model } from 'mongoose';
import { BuyDto } from './app/dto/buy.dto';
import { ProductEntity } from './products/product.entity';
import { ProductDocument } from './products/product.schema';
import { UserEntity } from './users/user.entity';
import { UserDocument } from './users/user.schema';
import { COINS } from './shared/constants';

@Injectable()
export class AppService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectModel('Product') private productModel: Model<ProductDocument>,
  ) {}
  async buy(buyerId: string, buyDto: BuyDto) {
    const resetAndGetChange =
      buyDto.resetAndGetChange !== undefined ? buyDto.resetAndGetChange : true;
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const buyer = await this.userModel.findById(buyerId).session(session);
      const product = await this.productModel
        .findById(buyDto.productId)
        .populate('seller')
        .session(session);

      if (!product) {
        throw new HttpException('Product not found', HttpStatus.BAD_REQUEST);
      }
      const seller = product.seller as any;

      if (product.amountAvailable === 0) {
        throw new HttpException(
          'Product is out of stock',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (product.amountAvailable < buyDto.quantity) {
        throw new HttpException(
          `We only have ${product.amountAvailable} in stock.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (buyer.deposit < product.cost * buyDto.quantity) {
        throw new HttpException('Insufficient funds', HttpStatus.BAD_REQUEST);
      }

      const totalCost = product.cost * buyDto.quantity;
      let change = [],
        totalChange = 0;
      if (resetAndGetChange) {
        totalChange = buyer.deposit - totalCost;
        change = getChange(totalChange);
        buyer.deposit = 0;
      } else {
        buyer.deposit -= totalCost;
      }
      await buyer.save({ session });

      seller.deposit += totalCost;
      await seller.save({ session });

      product.amountAvailable -= buyDto.quantity;
      await product.save({ session });

      const productToReturn = instanceToPlain(
        new ProductEntity(product.toObject()),
      );

      await session.commitTransaction();
      return {
        totalCost,
        totalChange,
        change,
        currentDeposit: buyer.deposit,
        product: productToReturn,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

const getChange = (totalChange: number) => {
  const change = [];
  let remainingChange = totalChange;
  for (const coin of COINS) {
    if (remainingChange === 0) break;
    const amount = Math.floor(remainingChange / coin);
    for (let i = 0; i < amount; i++) change.push(coin);
    remainingChange -= amount * coin;
  }
  return change;
};
