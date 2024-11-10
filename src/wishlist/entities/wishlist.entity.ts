// src/wishlist/entities/wishlist.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Auction } from '@/src/auctions/entities/auction.entity';
import { User } from '@/src/user/entities/user.entity';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User; // Liên kết đến User entity

  @ManyToOne(() => Auction, (auction) => auction.id)
  @JoinColumn({ name: 'auctionId' })
  auction: Auction; // Liên kết đến Auction entity
}
