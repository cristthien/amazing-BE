// src/wishlist/entities/wishlist.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Auction } from '@/src/auctions/entities/auction.entity';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false }) // Set nullable to false for auctionSlug
  user_id: string;

  @ManyToOne(() => Auction, (auction) => auction.id)
  @JoinColumn({ name: 'auctionId' })
  auction: Auction; // Liên kết đến Auction entity
}
