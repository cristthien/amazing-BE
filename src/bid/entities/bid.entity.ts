import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '@/src/user/entities/user.entity';

@Entity()
export class Bid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true }) // Set nullable to false to enforce non-null constraint
  amount: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ nullable: false }) // Set nullable to false for auctionSlug
  auctionSlug: string;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
    nullable: false,
  }) // Enforce non-null constraint
  @JoinColumn({ name: 'userId' })
  user: User;
}
