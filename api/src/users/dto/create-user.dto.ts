import { IsEmail, IsIn, MinLength } from 'class-validator';
import { Role } from 'src/shared/enums/role.enum';

export class CreateUserDto {
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsIn([Role.Seller, Role.Buyer])
  role: Role.Seller | Role.Buyer;
}
