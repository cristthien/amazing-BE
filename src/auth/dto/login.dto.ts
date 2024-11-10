import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class loginDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(20, { message: 'Password must be no longer than 20 characters' })

  // Password must contain at least one number, one special character, and allow accented characters
  @Matches(/[A-Za-z0-9@$!%*?&]/, {
    message:
      'Password must contain at least one special character, number, or letter',
  })

  // Ensure at least one number and one special character
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  @Matches(/[@$!%*?&]/, {
    message: 'Password must contain at least one special character',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(20, { message: 'Username must be no longer than 20 characters' })
  username: string;
}
