import { Exclude, Expose, instanceToPlain, Transform } from 'class-transformer';
import mongoose from 'mongoose';
import { Role } from 'src/shared/enums/role.enum';
import { UserEntity } from 'src/users/user.entity';

export class ProductEntity {
  @Exclude()
  _id: string;

  productName: string;
  cost: number;
  amountAvailable: number;

  @Expose({ groups: [Role.Admin] })
  createdAt: Date;

  @Expose({ groups: [Role.Admin] })
  updatedAt: Date;

  @Expose()
  get id(): string {
    return this._id.toString();
  }

  @Transform(({ value }) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value instanceof mongoose.Types.ObjectId) {
      return value.toString();
    }
    return instanceToPlain(new UserEntity(value));
  })
  seller: any;

  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
  }
}
