import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule
import { Auction } from './entities/auction.entity'; // Import Auction entity
import { Category } from '../categories/entities/category.entity'; // Import Category entity
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { RolesGuard } from '../auth/passport/roles.guard';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Auction, Category, User]), UserModule], // Đăng ký các entity với TypeOrmModule
  controllers: [AuctionsController],
  providers: [AuctionsService, JwtAuthGuard, RolesGuard],
  exports: [AuctionsService],
})
export class AuctionsModule {}
