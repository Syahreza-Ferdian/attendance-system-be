import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateDivisionDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @ApiProperty({
    description: 'Name of the division',
  })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Description of the division',
  })
  description?: string;
}
