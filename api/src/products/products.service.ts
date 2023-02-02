import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDirection } from 'src/shared/enums/orderDirection.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductDocument } from './product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private productModel: Model<ProductDocument>,
  ) {}

  create(
    sellerId: string,
    createProductDto: CreateProductDto,
  ): Promise<ProductDocument> {
    const createdProduct = new this.productModel({
      ...createProductDto,
      seller: sellerId,
    });
    return createdProduct.save();
  }

  findAll(listProductsDto: ListProductsDto): Promise<ProductDocument[]> {
    const filters = {};
    if (listProductsDto.sellerId) {
      filters['seller'] = listProductsDto.sellerId;
    }
    if (listProductsDto.available !== undefined) {
      filters['amountAvailable'] = listProductsDto.available
        ? { $gt: 0 }
        : { $eq: 0 };
    }
    let query = this.productModel.find(filters);
    const direction =
      (listProductsDto.orderDirection &&
        OrderDirection[listProductsDto.orderDirection]) ||
      OrderDirection.ASC;
    if (listProductsDto.orderBy) {
      query = query.sort({ [listProductsDto.orderBy]: direction });
    }

    return query.exec();
  }

  findOne(id: string) {
    return this.productModel.findById(id).exec();
  }

  update(id: string, updateProductDto: UpdateProductDto, requesterId: string) {
    const options = {
      returnDocument: 'after',
    } as any;
    const query = requesterId // if requesterId is null, it means that the requester is an admin
      ? this.productModel.findOneAndUpdate(
          {
            _id: id,
            seller: requesterId,
          },
          updateProductDto,
          options,
        )
      : this.productModel.findByIdAndUpdate(id, updateProductDto, options);
    return query.exec();
  }

  remove(id: string, requesterId: string) {
    const query = requesterId // if requesterId is null, it means that the requester is an admin
      ? this.productModel.findOneAndDelete({
          _id: id,
          seller: requesterId,
        })
      : this.productModel.findByIdAndDelete(id);
    return query.exec();
  }
}
