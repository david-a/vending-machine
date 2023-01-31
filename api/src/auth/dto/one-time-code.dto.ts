import { IsString } from 'class-validator';

export class OneTimeCodeDto {
  @IsString()
  username: string;
}
