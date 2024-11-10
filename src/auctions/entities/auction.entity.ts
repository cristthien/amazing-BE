import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '@/src/categories/entities/category.entity';

@Entity('auctions')
export class Auction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Category, (category) => category.id, { nullable: false }) // Link to Category
  @JoinColumn({ name: 'category_id' }) // Thiết lập cột khóa ngoại
  category: Category;

  @Column({ type: 'varchar', length: 50, nullable: true })
  brand: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  model: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  condition: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
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
}
