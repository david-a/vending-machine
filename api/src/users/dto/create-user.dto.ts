import { IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;
}
