import { MailerService } from '@nestjs-modules/mailer';
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from '../common/decorator/customize';
import { ApiTags } from '@nestjs/swagger';
import { loginDto } from './dto/login.dto';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { RolesGuard } from './passport/roles.guard';
import { Roles } from '../common/decorator/roles.decorator';
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerServices: MailerService,
  ) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
  @Post('register')
  @Public()
  async register(@Body() registerDto: loginDto) {
    try {
      // Call the service to handle registration logic
      return await this.authService.handleRegister(registerDto);
    } catch (error) {
      throw new BadRequestException('Registration failed: ' + error.message);
    }
  }

  @Get('validate-email')
  @Public() // This is a custom decorator that might bypass guards if needed
  async validateEmail(
    @Query('code') cipherText: string,
    @Query('email') email: string,
  ) {
    try {
      // Call the service to handle registration logic
      return await this.authService.ValidateEmail(email, cipherText);
    } catch (error) {
      throw new BadRequestException('Validate failed: ' + error.message);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getHello(): string {
    return 'Hello World! - Gia Thien';
  }
}
