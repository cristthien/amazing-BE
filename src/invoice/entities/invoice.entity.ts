import { PaymentMethod } from './../../common/enums/index';
import { Auction } from '@/src/auctions/entities/auction.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userID: string;

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

  @Column({
    type: 'enum',
    enum: PaymentMethod, // Chỉ định type là enum và gắn enum đã định nghĩa
    nullable: true, // Cho phép null
  })
  paymentMethod: PaymentMethod | null; // Có thể null

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phoneNumber: string;
}
