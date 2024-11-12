import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';
import { Bid } from './entities/bid.entity';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { RolesGuard } from '../auth/passport/roles.guard';
import { UserModule } from '../user/user.module';
import { AuctionsModule } from '../auctions/auctions.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Bid]),
    UserModule,
    AuctionsModule,
    UserModule,
  ], // Import Bid entity here
  controllers: [BidController],
  providers: [BidService, JwtAuthGuard, RolesGuard],
})
export class BidModule {}
