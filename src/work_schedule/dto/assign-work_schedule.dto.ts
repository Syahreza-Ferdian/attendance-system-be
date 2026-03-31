import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AssignWorkScheduleDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'ID of the work schedule to assign',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  workScheduleId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one user ID must be provided' })
  @IsString({ each: true, message: 'Each user ID must be a string' })
  @ApiProperty({
    description: 'List of user IDs to assign the work schedule to',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
  })
  userIds: string[];
}
