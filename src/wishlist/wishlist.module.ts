import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { Wishlist } from './entities/wishlist.entity'; // Import Wishlist entity
import { AuctionsModule } from '../auctions/auctions.module';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { RolesGuard } from '../auth/passport/roles.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wishlist]),
    AuctionsModule,
    UserModule, // Register entities with TypeOrmModule
  ],
  controllers: [WishlistController],
  providers: [WishlistService, JwtAuthGuard, RolesGuard],
})
export class WishlistModule {}
