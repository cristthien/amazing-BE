import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@/src/user/user.service';
import {
  ComparePasswordHelper,
  HashPasswordHelper,
} from '@/src/common/helpers/utils';
import { JwtService } from '@nestjs/jwt';
import { registerDto } from './dto/register.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { UserRole } from '../common/enums';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private readonly mailerServices: MailerService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    // Retrieve the user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Validate the password
    const isPasswordValid = await ComparePasswordHelper(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Need to valid your email.');
    }
    // Return user data excluding sensitive fields, such as password
    delete user.password;
    return user;
  }
  async login(user: any) {
    // Tạo payload cho JWT
    const payload = { id: user.id, email: user.emai, role: user.role }; // Cũng có thể thêm các thông tin khác nếu cần
    // Trả về access token
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { username: user.username, role: user.role },
    };
  }
  handleRegister = async (registerDto: registerDto, ad = false) => {
    const user = await this.usersService.create({
      ...registerDto,
    });
    const key = ad
      ? `${user.username}gi@thien${user.password}admin`
      : `${user.username}gi@thien${user.password}`;
    console.log(key);
    const cipherText = await HashPasswordHelper(key);
    const apiUrl = this.configService.get<string>('FRONT_URL'); // Dễ dàng truy cập từ .env

    this.mailerServices.sendMail({
      to: user.email, // list of receivers
      subject: 'Activate your account', // Subject line
      template: 'register.hbs',
      context: {
        name: user.username,
        activationLink: `${apiUrl}/validate-email?code=${cipherText}&email=${user.email}`,
      },
    });
    const newUser = {
      email: user.email,
      username: user.username,
    };
    return newUser;
  };
  async ValidateEmail(email: string, cipherText: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    try {
      // Use ComparePasswordHelper to check if the plain text password matches the hashed password
      const isValid = await ComparePasswordHelper(
        `${user.username}gi@thien${user.password}`,
        cipherText,
      );

      if (isValid) {
        // Update the `isEmailVerified` field to true
        await this.usersService.update(user.id, {
          isEmailVerified: true,
        });
        return { message: 'Email successfully verified' };
      }
      console.log('giathi');
      const isValidAdmin = await ComparePasswordHelper(
        `${user.username}gi@thien${user.password}admin`,
        cipherText,
      );
      if (isValidAdmin) {
        // Update the `isEmailVerified` field to true
        await this.usersService.update(user.id, {
          role: UserRole.Admin,
          isEmailVerified: true,
        });
        return { message: 'Email successfully verified' };
      }

      throw new UnauthorizedException('Fail to validate email');
    } catch (error: any) {
      throw new UnauthorizedException(error.message);
    }
  }
}
