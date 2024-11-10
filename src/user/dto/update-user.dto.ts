import {
  IsString,
  IsEmail,
  IsOptional,
  Length,
  IsEnum,
  isBoolean,
  IsBoolean,
} from 'class-validator';
import { Gender } from '../entities/user.entity';

export default class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @Length(4, 10)
  role?: string;

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;
}
