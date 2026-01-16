import { Module, Logger } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
import { ConfigModule } from '@nestjs/config';
import { User } from './entities/user.entity';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import dotenv from 'dotenv';
dotenv.config();

const logger = new Logger('AppModule');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      username: process.env.DB_USER,
      password:
        String(process.env.DB_PASSWORD) !== undefined
          ? String(process.env.DB_PASSWORD)
          : undefined,
      database: process.env.DB_NAME,
      entities: [User],
      synchronize: true,
      logging: true,
    }),
    UsersModule,
    AuthModule,
    MailerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {
  constructor() {
    console.log('🚀 Application Module Initialized');
    console.log('📦 Database Configuration:');
    console.log(`  - Host: ${process.env.DB_HOST}`);
    console.log(`  - Port: ${process.env.DB_PORT}`);
    console.log(`  - Database: ${process.env.DB_NAME}`);
    logger.log('Application Module initialized with database logging enabled');
  }
}

