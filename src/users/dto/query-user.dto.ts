import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQuery } from 'src/common/pagination/pagination.query';

export class UserQuery extends PaginationQuery {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description:
      'Search term to filter users by username, email, first name, or last name',
  })
  search?: string; // cari bdsrkan username, email, firstName, lastName

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Position ID to filter users by their position',
  })
  positionId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Division ID to filter users by their division',
  })
  divisionId?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Role ID must be a positive integer' })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @ApiProperty({
    description: 'Role ID to filter users by their role',
    example: 1,
  })
  roleId?: number;
}
