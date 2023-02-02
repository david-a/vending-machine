import { IsDivisibleBy, IsInt, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @MinLength(3)
  productName: string;

  @IsDivisibleBy(5)
  @Min(0)
  cost: number;

  @IsInt()
  @Min(0)
  amountAvailable: number;
}
