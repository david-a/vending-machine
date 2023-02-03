import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { booleanTransformer } from 'src/shared/transformers';

export class BuyDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsBoolean()
  @Transform(booleanTransformer)
  resetAndGetChange: boolean;
}
