import mongoose, { HydratedDocument, model } from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    username: { required: true, type: String, unique: true },
    email: { required: true, type: String, unique: true, match: /.+@.+\..+/ },
    role: {
      required: true,
      type: String,
      immutable: true,
      enum: ['buyer', 'seller'],
    },
    deposit: { required: true, type: Number, default: 0 },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', UserSchema);
export type UserDocument = HydratedDocument<typeof User>;
