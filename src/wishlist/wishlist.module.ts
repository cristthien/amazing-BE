import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { Wishlist } from './entities/wishlist.entity'; // Import Wishlist entity
import { Auction } from '@/src/auctions/entities/auction.entity'; // Import Auction entity
import { User } from '@/src/user/entities/user.entity'; // Import User entity

@Module({
  imports: [
    TypeOrmModule.forFeature([Wishlist, Auction, User]), // Register entities with TypeOrmModule
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
