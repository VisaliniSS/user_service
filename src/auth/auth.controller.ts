import { Controller, Post, Body, Logger, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    console.log(`📨 POST /auth/register - Registration request for email: ${dto.email}`);
    this.logger.log(`Registration request for email: ${dto.email}`);
    return this.authService.register(dto);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    console.log(`✉️  GET /auth/verify-email - Email verification request`);
    this.logger.log(`Email verification request received`);
    
    if (!token) {
      throw new Error('Verification token is required');
    }
    
    return this.authService.verifyEmail(token);
  }

  @Post('verify-email')
  async verifyEmailPost(@Body() dto: VerifyEmailDto) {
    console.log(`✉️  POST /auth/verify-email - Email verification request`);
    this.logger.log(`Email verification request received`);
    return this.authService.verifyEmail(dto.token);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    console.log(`🔑 POST /auth/login - Login request for email: ${dto.email}`);
    this.logger.log(`Login request for email: ${dto.email}`);
    return this.authService.loginWithCredentials(dto.email, dto.password);
  }

  @Get('test-email')
  async testEmail(@Query('email') email: string) {
    console.log(`📬 GET /auth/test-email - Testing email to: ${email}`);
    this.logger.log(`Testing email to: ${email}`);
    
    if (!email) {
      throw new Error('Email parameter is required');
    }

    return this.authService.sendTestEmail(email);
  }
}
