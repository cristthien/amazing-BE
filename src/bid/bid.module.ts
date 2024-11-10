import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';
import { Bid } from './entities/bid.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bid])], // Import Bid entity here
  controllers: [BidController],
  providers: [BidService],
})
export class BidModule {}
