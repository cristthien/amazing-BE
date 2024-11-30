// src/wishlist/dto/create-wishlist.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @IsNotEmpty()
  auctionSlug: string;
}
