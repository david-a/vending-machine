import { IsIn } from 'class-validator';
import { COINS } from 'src/shared/constants';

export class DepositDto {
  @IsIn(COINS)
  amount: string;
}
