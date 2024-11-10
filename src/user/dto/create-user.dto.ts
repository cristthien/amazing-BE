// create a file named user.dto.ts in a 'dto' folder
import {
  IsString,
  IsEmail,
  IsOptional,
  Length,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Gender } from '../entities/user.entity';

export default class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

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
