import { IsNotEmpty, IsHexadecimal, MinLength } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty({ message: 'Token is required' })
  @IsHexadecimal({ message: 'Token must be a valid hexadecimal string' })
  @MinLength(64, { message: 'Token must be at least 64 characters long' })
  token: string;
}
