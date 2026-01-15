import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  profile(@Request() req) {
    return req.user;
  }
}
