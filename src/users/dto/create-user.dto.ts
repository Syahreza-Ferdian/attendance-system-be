import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'john_doe',
  })
  username: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @ApiProperty({
    description: 'Password for the user',
    example: 'securePassword123',
  })
  password: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Email address for the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @IsNotEmpty()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @ApiProperty({
    description: 'First name for the user',
    example: 'John',
  })
  firstName: string;

  @IsNotEmpty()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @ApiProperty({
    description: 'Last name for the user',
    example: 'Doe',
  })
  lastName: string;

  @IsNotEmpty()
  @IsPhoneNumber('ID', {
    message: 'Phone number must be a valid Indonesian phone number',
  })
  @ApiProperty({
    description: 'Phone number for the user',
    example: '+6281234567890',
  })
  phoneNumber: string;

  @IsNotEmpty()
  @IsNumber({}, { message: 'Role ID must be a number' })
  @Min(1, { message: 'Role ID must be a positive integer' })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @ApiProperty({
    description: 'Role ID for the user',
    example: 1,
  })
  roleId: number;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Position ID for the user',
    example: 'pos_123',
  })
  positionId: string;
}
