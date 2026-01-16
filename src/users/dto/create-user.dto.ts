import { IsEmail, IsNotEmpty, MinLength, IsMobilePhone, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Full name is required' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Full name can only contain letters and spaces' })
  fullName: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Mobile number is required' })
  @IsMobilePhone(undefined, { strictMode: false }, { message: 'Mobile number must be a valid phone number' })
  mobileNumber: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, { 
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&)' 
  })
  password: string;
}
