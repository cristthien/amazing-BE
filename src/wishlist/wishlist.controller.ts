import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  // Tạo mới wishlist
  @Post()
  async create(
    @Body() createWishlistDto: CreateWishlistDto,
  ): Promise<Wishlist> {
    return this.wishlistService.addToWishlist(createWishlistDto);
  }

  // Lấy tất cả wishlist
  @Get()
  findAll() {
    return this.wishlistService.findAll();
  }

  // Lấy wishlist theo id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wishlistService.findOne(+id); // Chuyển id sang number
  }

  // // Cập nhật wishlist theo id
  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateWishlistDto: UpdateWishlistDto,
  // ) {
  //   return this.wishlistService.update(+id, updateWishlistDto); // Chuyển id sang number
  // }

  // Xóa wishlist theo id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wishlistService.remove(+id); // Chuyển id sang number
  }
}
