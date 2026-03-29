import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateWorkScheduleDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  startTime: string; // Format: "HH:mm"

  @IsNotEmpty()
  @IsString()
  endTime: string; // Format: "HH:mm"

  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'Late tolerance minutes must be a positive integer' })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  lateToleranceMinutes: number;

  @Transform(({ value }: { value: string | number[] }) => {
    if (typeof value === 'string') {
      return value.split(',').map((day) => parseInt(day.trim(), 10));
    }
    if (Array.isArray(value)) {
      return value.map((day) => parseInt(String(day), 10));
    }
    return value;
  })
  @IsNotEmpty()
  @IsArray({ message: 'Work schedule days must be an array of integers' })
  @ArrayMinSize(1, {
    message: 'At least one work schedule day must be provided',
  })
  @IsInt({
    each: true,
    message: 'Each day of week must be an integer between 0 and 6',
  })
  @Min(0, {
    each: true,
    message: 'Day of week must be between 0 (Sunday) and 6 (Saturday)',
  })
  @Max(6, {
    each: true,
    message: 'Day of week must be between 0 (Sunday) and 6 (Saturday)',
  })
  workScheduleDays: number[]; // Array of dayOfWeek (0-6, where 0 = Sunday, 1 = Monday, ..., 6 = Saturday)
}
