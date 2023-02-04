import mongoose, { HydratedDocument, model } from 'mongoose';
import { Role } from 'src/shared/enums/role.enum';
import { UserEntity } from './user.entity';

export const UserSchema = new mongoose.Schema(
  {
    username: { required: true, type: String, unique: true },
    email: { required: true, type: String, unique: true, match: /.+@.+\..+/ },
    role: {
      required: true,
      type: String,
      immutable: true,
      enum: Role,
    },
    deposit: { required: true, type: Number, default: 0 },
  },
  { timestamps: true },
);

export const User = mongoose.model<UserEntity>('User', UserSchema);
export type UserDocument = HydratedDocument<UserEntity>;
