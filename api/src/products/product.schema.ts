import mongoose, { HydratedDocument } from 'mongoose';
import { ProductEntity } from './product.entity';

export const ProductSchema = new mongoose.Schema(
  {
    productName: { required: true, type: String, unique: true },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cost: { required: true, type: Number, min: 0 },
    amountAvailable: {
      required: true,
      type: Number,
      min: 0,
    },
  },
  { timestamps: true },
);

export const Product = mongoose.model<ProductEntity>('Product', ProductSchema);
export type ProductDocument = HydratedDocument<ProductEntity>;
