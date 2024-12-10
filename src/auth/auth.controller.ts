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
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { registerDto } from './dto/register.dto';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { RolesGuard } from './passport/roles.guard';
import { Roles } from '../common/decorator/roles.decorator';
import { LoginDto } from './dto/login.dto';
@ApiTags('1 - Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto }) // Define the request body as LoginDto
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        statusCode: 200,
        message: 'Request successful',
        data: {
          accessToken: 'your-access-token-here',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
  @Post('register')
  @Public()
  @ApiOperation({ summary: 'User Registration' })
  @ApiBody({
    description: 'User registration data',
    type: registerDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Registration successful',
    schema: {
      example: {
        statusCode: 200,
        message: 'Request successful',
        data: {
          email: 'cristhuuthien@gmail.com',
          username: 'giathien',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Registration failed',
  })
  async register(@Body() registerDto: registerDto) {
    try {
      return await this.authService.handleRegister(registerDto);
    } catch (error) {
      throw new BadRequestException('Registration failed: ' + error.message);
    }
  }

  @Get('validate-email')
  @ApiOperation({ summary: 'Validate email when register' })
  @Public() // This is a custom decorator that migt bypass guards if needed
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

  @Post('register-admin')
  @UseGuards(JwtAuthGuard, RolesGuard) // Use the guards for authentication and role check
  @Roles('admin') // Restrict this endpoint to 'admin' role
  @ApiOperation({ summary: 'Register an Admin user' })
  @ApiBody({ type: registerDto }) // Specify the expected request body for registration
  @ApiResponse({
    status: 201,
    description: 'Admin registered successfully',
    type: Object, // You can replace 'Object' with a specific DTO for the response if needed
  })
  @ApiResponse({
    status: 400,
    description: 'Registration failed',
  })
  async registerAdmin(@Body() registerDto: registerDto) {
    const ad = true; // Assuming this flag denotes that the user is an admin
    try {
      // Call the service to handle registration logic, passing 'ad' as true for admin
      return await this.authService.handleRegister(registerDto, ad);
    } catch (error) {
      throw new BadRequestException('Registration failed: ' + error.message);
    }
  }
}
