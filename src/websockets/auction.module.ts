import { JwtConfigService } from '@/src/config/jwt.config';
import { UserModule } from '@/src/user/user.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuctionGateway } from './auction-gateway';
import { BidModule } from '@/src/bid/bid.module';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [],
      useClass: JwtConfigService,
    }),
    BidModule,
  ],
  providers: [AuctionGateway],
})
export class AuctionWSModule {}
