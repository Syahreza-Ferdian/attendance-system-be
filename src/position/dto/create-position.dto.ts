import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePositionDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @IsNotEmpty()
  @IsString()
  divisionId: string;

  @IsOptional()
  @IsString()
  description?: string;
}
