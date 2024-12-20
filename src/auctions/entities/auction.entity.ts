import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '@/src/categories/entities/category.entity';
import { User } from '@/src/user/entities/user.entity';
import { AuctionStatus } from '@/src/common/enums';
@Entity('auctions')
export class Auction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  slug: string;

  @ManyToOne(() => Category, (category) => category.id, { nullable: false }) // Link to Category
  @JoinColumn({ name: 'category_id' }) // Thiết lập cột khóa ngoại
  category: Category;

  @Column({ type: 'varchar', length: 50, nullable: true })
  brand: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  model: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  condition: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  starting_bid: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  highest_bid: number;

  @Column({ type: 'int', default: 0 })
  bid_count: number;

  @Column({ type: 'jsonb', nullable: true })
  specifications: any;

  @Column('text', { array: true, nullable: true })
  images: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: AuctionStatus,
    default: AuctionStatus.PENDING, // Trạng thái mặc định là 'pending' (chuẩn bị bắt đầu)
  })
  status: AuctionStatus; // Trường status sử dụng enum
}
