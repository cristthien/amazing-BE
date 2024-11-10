import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// Define an enum for gender
export enum Gender {
  Male = 'M',
  Female = 'F',
  Other = 'O',
}

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

  @Column({ type: 'varchar', default: 'user' })
  role: string;

  @Column({ type: 'varchar', nullable: true })
  googleId: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;
}
