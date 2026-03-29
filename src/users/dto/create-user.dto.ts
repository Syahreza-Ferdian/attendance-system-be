import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  firstName: string;

  @IsNotEmpty()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  lastName: string;

  @IsNotEmpty()
  @IsPhoneNumber('ID', {
    message: 'Phone number must be a valid Indonesian phone number',
  })
  phoneNumber: string;

  @IsNotEmpty()
  @IsNumber({}, { message: 'Role ID must be a number' })
  @Min(1, { message: 'Role ID must be a positive integer' })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  roleId: number;

  @IsNotEmpty()
  positionId: string;
}
