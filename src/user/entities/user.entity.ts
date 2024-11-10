import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Gender, UserRole } from '@/src/common/enums';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  username: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  // Gender field using enum
  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  // Role field using enum with default value 'user'
  @Column({ type: 'enum', enum: UserRole, default: UserRole.User })
  role: UserRole;

  @Column({ type: 'varchar', nullable: true })
  googleId: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  // Avatar field, optional, can be a URL or file path
  @Column({ type: 'varchar', nullable: true })
  avatar: string; // Path or URL to the avatar image
}
