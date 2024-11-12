import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Auction } from '@/src/auctions/entities/auction.entity';
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail: string; // Cột thumbnail mới

  @OneToMany(() => Auction, (auction) => auction.category)
  products: Auction[];
}
