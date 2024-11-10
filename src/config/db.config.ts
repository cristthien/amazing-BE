import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Auction } from '../auctions/entities/auction.entity';
import { Bid } from '../bid/entities/bid.entity';
import { Wishlist } from '../wishlist/entities/wishlist.entity';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Category, Auction, Bid, Wishlist],
  synchronize: true,
});
