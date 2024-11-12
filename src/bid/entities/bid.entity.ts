import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Bid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  auctionId: number;

  @Column()
  userId: number;

  @Column()
  amount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
