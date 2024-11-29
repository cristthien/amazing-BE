import {
  Controller,
  Post,
  Body,
  Request,
  Delete,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { Roles } from '@/src/common/decorator/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('6 - Wishlists')
@Controller('wishlists')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  // Tạo mới wishlist
  @Post()
  @Roles('user')
  async create(
    @Body() createWishlistDto: CreateWishlistDto,
    @Request() req: any,
  ) {
    return this.wishlistService.addToWishlist(createWishlistDto, req.user);
  }

  // // Lấy tất cả wishlist
  // @Get()
  // findAll() {
  //   return this.wishlistService.findAll();
  // }

  // Lấy wishlist theo id
  @Get('')
  @Roles('user')
  async findOne(
    @Request() req: any,
    @Query('page') page = 1, // Default to page 1
    @Query('limit') limit = 10,
  ) {
    // Default to 10 items per page) {
    return this.wishlistService.GetAllWishlist(`${req.user.id}`, +page, +limit);
  }

  // // // Cập nhật wishlist theo id
  // // @Patch(':id')
  // // update(
  // //   @Param('id') id: string,
  // //   @Body() updateWishlistDto: UpdateWishlistDto,
  // // ) {
  // //   return this.wishlistService.update(+id, updateWishlistDto); // Chuyển id sang number
  // // }

  // Xóa wishlist theo id
  @Delete(':id')
  @Roles('user')
  remove(@Param('id') id: number, @Request() req: any) {
    return this.wishlistService.remove(id, req.user); // Chuyển id sang number
  }
}
