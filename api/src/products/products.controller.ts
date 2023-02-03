import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role } from 'src/shared/enums/role.enum';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { AppGuard } from 'src/auth/guards/app.guard';
import { ProductEntity } from './product.entity';
import { ListProductsDto } from './dto/list-products.dto';
import { ProductDocument } from './product.schema';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AppGuard)
  @Roles(Role.Seller) // TODO: enable admin to create products with a selected seller
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req,
  ): Promise<ProductEntity> {
    const product = await this.productsService.create(
      req.user.id,
      createProductDto,
    );
    return new ProductEntity(product.toObject());
  }

  @Get()
  async findAll(@Query() listProductsDto: ListProductsDto) {
    // TODO: implement pagination with skip & limit. NOTE: in very large sets it can have a performance impact when skip is large.
    // TODO: implement a more general sorting and filtering.
    return (await this.productsService.findAll(listProductsDto)).map(
      (product) => new ProductEntity(product.toObject()),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.productsService.findOne(id);
    if (!result)
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    return new ProductEntity(result.toObject());
  }

  @UseGuards(AppGuard)
  @Roles(Role.Seller, Role.Admin)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req,
  ) {
    const requesterId = req.user.isAdmin ? null : req.user.id;
    const result = await this.productsService.update(
      id,
      updateProductDto,
      requesterId,
    );
    validateResultByUser(result, req.user);

    return new ProductEntity((result as any).toObject());
  }

  @UseGuards(AppGuard)
  @Roles(Role.Seller, Role.Admin)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    // Implement soft delete. Note: requires a managing a status/deletedAt field in the model and queries scopes.
    const requesterId = req.user.isAdmin ? null : req.user.id;
    const result = await this.productsService.remove(id, requesterId);
    validateResultByUser(result, req.user);

    return new ProductEntity(result.toObject());
  }
}

const validateResultByUser = (result, user) => {
  if (!result)
    throw new HttpException(
      user.isAdmin ? 'Product not found' : 'Product not found on your account',
      HttpStatus.NOT_FOUND,
    );
};
