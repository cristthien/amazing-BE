import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule
import { Auction } from './entities/auction.entity'; // Import Auction entity
import { Category } from '../categories/entities/category.entity'; // Import Category entity

@Module({
  imports: [TypeOrmModule.forFeature([Auction, Category])], // Đăng ký các entity với TypeOrmModule
  controllers: [AuctionsController],
  providers: [AuctionsService],
  exports: [AuctionsService],
})
export class AuctionsModule {}
