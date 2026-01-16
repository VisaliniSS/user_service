import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto, verificationToken: string) {
    console.log(`👤 Creating new user: ${dto.email}`);
    this.logger.log(`Creating new user: ${dto.email}`);

    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(dto.password, salt);

      console.log(`🔐 Password hashed successfully for: ${dto.email}`);

      const user = this.usersRepository.create({
        fullName: dto.fullName,
        email: dto.email,
        mobileNumber: dto.mobileNumber,
        password: hashed,
        emailVerificationToken: verificationToken,
        isEmailVerified: false,
      });

      const savedUser = await this.usersRepository.save(user);
      console.log(`✅ User created and saved successfully: ${savedUser.id}`);
      this.logger.log(`User created successfully: ${savedUser.id}`);

      return savedUser;
    } catch (error) {
      console.error(`❌ Error creating user ${dto.email}:`, error.message);
      this.logger.error(`Error creating user ${dto.email}`, error);
      throw error;
    }
  }

  async findByEmail(email: string) {
    console.log(`🔍 Finding user by email: ${email}`);
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      if (user) {
        console.log(`✅ User found: ${user.id}`);
      } else {
        console.log(`⚠️  User not found with email: ${email}`);
      }
      return user;
    } catch (error) {
      console.error(`❌ Error finding user by email ${email}:`, error.message);
      this.logger.error(`Error finding user by email ${email}`, error);
      throw error;
    }
  }

  async findByMobileNumber(mobileNumber: string) {
    console.log(`🔍 Finding user by mobile number: ${mobileNumber}`);
    try {
      const user = await this.usersRepository.findOne({ where: { mobileNumber } });
      if (user) {
        console.log(`✅ User found with mobile number: ${user.id}`);
      } else {
        console.log(`⚠️  User not found with mobile number: ${mobileNumber}`);
      }
      return user;
    } catch (error) {
      console.error(`❌ Error finding user by mobile number ${mobileNumber}:`, error.message);
      this.logger.error(`Error finding user by mobile number ${mobileNumber}`, error);
      throw error;
    }
  }

  async findById(id: string) {
    console.log(`🔍 Finding user by ID: ${id}`);
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (user) {
        console.log(`✅ User found: ${user.email}`);
      } else {
        console.log(`⚠️  User not found with ID: ${id}`);
      }
      return user;
    } catch (error) {
      console.error(`❌ Error finding user by ID ${id}:`, error.message);
      this.logger.error(`Error finding user by ID ${id}`, error);
      throw error;
    }
  }

  async findByVerificationToken(token: string) {
    console.log(`🔍 Finding user by verification token`);
    try {
      const user = await this.usersRepository.findOne({
        where: { emailVerificationToken: token, isEmailVerified: false },
      });
      if (user) {
        console.log(`✅ User found with verification token: ${user.id}`);
      } else {
        console.log(`⚠️  User not found with verification token`);
      }
      return user;
    } catch (error) {
      console.error(`❌ Error finding user by verification token:`, error.message);
      this.logger.error(`Error finding user by verification token`, error);
      throw error;
    }
  }

  async updateEmailVerification(userId: string) {
    console.log(`📧 Updating email verification status for user: ${userId}`);
    try {
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = null;

      const updatedUser = await this.usersRepository.save(user);
      console.log(`✅ Email verification updated for user: ${userId}`);
      this.logger.log(`Email verification updated for user: ${userId}`);

      return updatedUser;
    } catch (error) {
      console.error(`❌ Error updating email verification for user ${userId}:`, error.message);
      this.logger.error(`Error updating email verification for user ${userId}`, error);
      throw error;
    }
  }
}
