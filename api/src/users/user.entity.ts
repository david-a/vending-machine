import { Exclude, Expose } from 'class-transformer';
import { RequesterContext } from 'src/shared/enums/requester-context';
import { Role } from 'src/shared/enums/role.enum';

export class UserEntity {
  @Exclude()
  _id: string;

  username: string;

  @Expose({ groups: [RequesterContext.Self, Role.Admin] })
  email: string;

  @Expose({ groups: [RequesterContext.Self, Role.Admin] })
  deposit: number;

  @Expose({ groups: [Role.Admin] })
  createdAt: Date;

  @Expose({ groups: [Role.Admin] })
  updatedAt: Date;

  @Expose()
  get id(): string {
    return (this._id && this._id.toString()) || this._id;
  }

  @Expose({ groups: [Role.Admin] })
  role: string;

  get isAdmin(): boolean {
    return this.role === Role.Admin;
  }

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
