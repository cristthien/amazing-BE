import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseConfig } from './config/db.config';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';
import { RolesGuard } from './auth/passport/roles.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { CategoriesModule } from './categories/categories.module';
import { ServeStaticModule } from '@nestjs/serve-static';

import { mailerConfig } from './config/mailer.config';
import { serveStaticConfig } from './config/serve-static.config';
import { AuctionsModule } from './auctions/auctions.module';
import { BidModule } from './bid/bid.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { InvoiceModule } from './invoice/invoice.module';
import { AuctionWSModule } from './websockets/auction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    UserModule,
    AuthModule,
    HealthModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: mailerConfig,
      inject: [ConfigService],
    }),
    CategoriesModule,
    ServeStaticModule.forRoot(serveStaticConfig),
    AuctionsModule,
    BidModule,
    WishlistModule,
    InvoiceModule,
    AuctionWSModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
