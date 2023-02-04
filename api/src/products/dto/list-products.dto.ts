import { Transform } from 'class-transformer';
import {
  IsIn,
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { booleanTransformer } from 'src/shared/transformers';

export class ListProductsDto {
  // SORTING // TODO: make generic
  @IsOptional()
  @IsIn(['cost', 'productName', 'createdAt'])
  orderBy: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderDirection: 'ASC' | 'DESC';

  // FILTERS
  @IsOptional()
  @IsString()
  sellerId: string;

  @IsOptional()
  @IsBoolean()
  @Transform(booleanTransformer)
  available: boolean;

  @IsOptional()
  @IsString()
  productName: string;
}
