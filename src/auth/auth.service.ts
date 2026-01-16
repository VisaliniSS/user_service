import { Injectable, UnauthorizedException, Logger, BadRequestException, HttpException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MailerService } from '../mailer/mailer.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async validateUser(email: string, pass: string) {
    console.log(`🔍 Validating user with email: ${email}`);
    this.logger.log(`Validating user with email: ${email}`);

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      return null;
    }

    if (!user.isEmailVerified) {
      console.log(`⚠️  Email not verified for user: ${email}`);
      this.logger.warn(`Email not verified for user: ${email}`);
      throw new BadRequestException('Please verify your email first');
    }

    const matched = await bcrypt.compare(pass, user.password);
    if (matched) {
      console.log(`✅ User validated successfully: ${email}`);
      this.logger.log(`User validated successfully: ${email}`);
      // omit password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user as any;
      return result;
    }

    console.log(`❌ Password mismatch for user: ${email}`);
    return null;
  }

  async login(user: any) {
    console.log(`🔐 Generating JWT token for user: ${user.email}`);
    this.logger.log(`Generating JWT token for user: ${user.email}`);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    console.log(`✅ JWT token generated successfully for: ${user.email}`);
    return {
      access_token: token,
    };
  }

  async loginWithCredentials(email: string, password: string) {
    console.log(`🔑 Login attempt for email: ${email}`);
    this.logger.log(`Login attempt for email: ${email}`);

    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        console.log(`❌ Login failed: User not found for email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isEmailVerified) {
        console.log(`⚠️  Login failed: Email not verified for: ${email}`);
        throw new BadRequestException('Please verify your email first');
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        console.log(`❌ Login failed: Invalid password for email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log(`✅ Login successful for email: ${email}`);
      return this.login(user);
    } catch (error) {
      console.error(`❌ Login error for email ${email}:`, error.message);
      this.logger.error(`Login error for email ${email}`, error);
      throw error;
    }
  }

  async register(dto: CreateUserDto) {
    console.log(`📝 Registration attempt for email: ${dto.email}`);
    this.logger.log(`Registration attempt for email: ${dto.email}`);

    try {
      // Check if email already exists
      const existingEmail = await this.usersService.findByEmail(dto.email);
      if (existingEmail) {
        console.log(`❌ Registration failed: Email already registered: ${dto.email}`);
        throw new BadRequestException('Email is already registered');
      }

      // Check if mobile number already exists
      const existingMobile = await this.usersService.findByMobileNumber(dto.mobileNumber);
      if (existingMobile) {
        console.log(`❌ Registration failed: Mobile number already registered: ${dto.mobileNumber}`);
        throw new BadRequestException('Mobile number is already registered');
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      console.log(`🎫 Generated verification token for: ${dto.email}`);

      // Create user with verification token
      const user = await this.usersService.create(dto, verificationToken);
      console.log(`✅ User created successfully: ${user.id} (${dto.email})`);

      // Send verification email
      try {
        await this.mailerService.sendVerificationEmail(dto.email, dto.fullName, verificationToken);
        console.log(`✅ Verification email sent to: ${dto.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send verification email to ${dto.email}:`, emailError.message);
        this.logger.error(`Failed to send verification email to ${dto.email}`, emailError);
        throw new BadRequestException(`Failed to send verification email: ${emailError.message}`);
      }

      return {
        message: 'Registration successful. Please check your email to verify your account.',
        userId: user.id,
        email: user.email,
      };
    } catch (error) {
      console.error(`❌ Registration error for email ${dto.email}:`, error.message);
      this.logger.error(`Registration error for email ${dto.email}`, error);

      // Re-throw HTTP exceptions as-is
      if (error instanceof HttpException || error instanceof BadRequestException) {
        throw error;
      }

      // Handle database errors
      if (error.message && error.message.includes('duplicate')) {
        throw new BadRequestException('This email or mobile number is already registered');
      }

      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  async verifyEmail(token: string) {
    console.log(`🔐 Email verification attempt with token`);
    this.logger.log(`Email verification attempt`);

    try {
      const user = await this.usersService.findByVerificationToken(token);
      if (!user) {
        console.log(`❌ Verification failed: Invalid or expired token`);
        throw new BadRequestException('Invalid or expired verification token');
      }

      if (user.isEmailVerified) {
        console.log(`⚠️  Email already verified for: ${user.email}`);
        return {
          message: 'Email already verified',
          email: user.email,
        };
      }

      // Update user to mark email as verified
      const updatedUser = await this.usersService.updateEmailVerification(user.id);
      console.log(`✅ Email verified successfully for: ${updatedUser.email}`);

      return {
        message: 'Email verified successfully. You can now login.',
        email: updatedUser.email,
      };
    } catch (error) {
      console.error(`❌ Email verification error:`, error.message);
      this.logger.error(`Email verification error`, error);
      throw error;
    }
  }

  async sendTestEmail(email: string) {
    console.log(`🧪 Testing email delivery to: ${email}`);
    this.logger.log(`Testing email delivery to: ${email}`);

    try {
      const testToken = crypto.randomBytes(32).toString('hex');
      console.log(`📬 Sending test email with verification link...`);

      await this.mailerService.sendVerificationEmail(email, 'Test User', testToken);

      console.log(`✅ Test email sent successfully to: ${email}`);
      return {
        message: 'Test email sent successfully',
        email,
        token: testToken,
        verificationLink: `http://localhost:3001/api/v1/auth/verify-email?token=${testToken}`,
      };
    } catch (error) {
      console.error(`❌ Failed to send test email to ${email}:`, error.message);
      this.logger.error(`Failed to send test email to ${email}`, error);
      throw new BadRequestException(`Failed to send test email: ${error.message}`);
    }
  }
}
