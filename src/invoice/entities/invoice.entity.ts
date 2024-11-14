import { User } from '@/src/user/entities/user.entity';
import { Auction } from '@/src/auctions/entities/auction.entity';
// src/invoice/invoice.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userID: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => Auction, (auction) => auction.id)
  auction: Auction;

  @Column()
  amount: number;

  @Column()
  status: string; // E.g. 'pending', 'paid', 'cancelled'

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  paymentMethod: string; // E.g. 'credit card', 'paypal', etc.

  // Thêm thông tin địa chỉ và số điện thoại
  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phoneNumber: string;
}
