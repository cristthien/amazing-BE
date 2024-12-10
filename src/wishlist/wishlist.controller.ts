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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

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

  // Lấy wishlist theo id
  @Get('')
  @Roles('user')
  @ApiOperation({
    summary: 'Add an item to the wishlist',
    description:
      'Allows a user to add an item to their wishlist. The item details are provided in the request body.',
  })
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
  @ApiOperation({
    summary: 'Remove an item from the wishlist',
    description:
      'Allows a user to remove an item from their wishlist by providing the item ID.',
  })
  remove(@Param('id') id: number, @Request() req: any) {
    return this.wishlistService.remove(id, req.user); // Chuyển id sang number
  }
}
