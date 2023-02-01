import { Exclude, Expose } from 'class-transformer';
import { Role } from 'src/shared/enums/role.enum';

export class UserEntity {
  username: string;
  email: string;
  deposit: number;

  @Expose({ groups: [Role.Admin] })
  createdAt: Date;

  @Expose({ groups: [Role.Admin] })
  updatedAt: Date;

  @Expose()
  get id(): string {
    return this['_id'].toString();
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
