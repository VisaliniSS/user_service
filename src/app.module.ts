import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      username: process.env.DB_USERNAME,
      password:
        String(process.env.DB_PASSWORD) !== undefined
          ? String(process.env.DB_PASSWORD)
          : undefined,
      database: process.env.DB_NAME,
      entities: [__dirname + '/entities/*{.entity,.entity.ts,.entity.js}'],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
