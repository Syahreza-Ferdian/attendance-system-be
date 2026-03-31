import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePositionDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @ApiProperty({
    description: 'Name of the position',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'ID of the division this position belongs to',
  })
  divisionId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Description of the position',
  })
  description?: string;
}
