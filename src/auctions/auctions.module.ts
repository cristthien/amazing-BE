import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule
import { Auction } from './entities/auction.entity'; // Import Auction entity
import { Category } from '@/src/categories/entities/category.entity'; // Import Category entity
import { JwtAuthGuard } from '@/src/auth/passport/jwt-auth.guard';
import { RolesGuard } from '@/src/auth/passport/roles.guard';
import { UserModule } from '@/src/user/user.module';
import { User } from '@/src/user/entities/user.entity';
import { AuctionTasksService } from './tasks/auction-tasks.service';
import { AuctionTasksActiveService } from './tasks/auction-tasks-active.service';
import { InvoiceModule } from '../invoice/invoice.module';
import { Bid } from '../bid/entities/bid.entity';
import { AuctionCronService } from './tasks/cron-task.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auction, Category, User, Bid]),
    UserModule,
    InvoiceModule,
  ], // Đăng ký các entity với TypeOrmModule
  controllers: [AuctionsController],
  providers: [
    AuctionsService,
    JwtAuthGuard,
    RolesGuard,
    AuctionCronService,
    AuctionTasksService,
    AuctionTasksActiveService,
  ],
  exports: [AuctionsService],
})
export class AuctionsModule {}
