import { IsString, IsEmail, IsOptional, Length, IsEnum } from 'class-validator';
import { UserRole } from '@/src/common/enums';

export default class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 20) // Giới hạn độ dài mật khẩu cho an toàn
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole = UserRole.User; // Mặc định là 'user'
}
