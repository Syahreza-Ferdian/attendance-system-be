import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AssignWorkScheduleDto {
  @IsNotEmpty()
  @IsString()
  workScheduleId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one user ID must be provided' })
  @IsString({ each: true, message: 'Each user ID must be a string' })
  userIds: string[];
}
