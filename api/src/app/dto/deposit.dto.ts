import { IsIn } from 'class-validator';

export class DepositDto {
  @IsIn([5, 10, 20, 50, 100])
  amount: string;
}
