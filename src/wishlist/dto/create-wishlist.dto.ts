// src/wishlist/dto/create-wishlist.dto.ts
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateWishlistDto {
  @IsInt()
  @IsNotEmpty()
  auctionId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;
}
