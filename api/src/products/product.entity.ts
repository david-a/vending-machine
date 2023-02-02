import { Exclude, Expose } from 'class-transformer';
import { Role } from 'src/shared/enums/role.enum';

export class ProductEntity {
  productName: string;
  cost: number;
  amountAvailable: number;

  @Expose({ groups: [Role.Admin] })
  createdAt: Date;

  @Expose({ groups: [Role.Admin] })
  updatedAt: Date;

  @Expose()
  get id(): string {
    return this['_id'].toString();
  }

  @Exclude()
  seller: string;

  @Expose()
  get sellerId(): string {
    return this['seller'].toString();
  }

  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
  }
}
