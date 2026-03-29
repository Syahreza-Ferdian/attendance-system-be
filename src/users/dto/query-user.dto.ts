import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQuery } from 'src/common/pagination/pagination.query';

export class UserQuery extends PaginationQuery {
  @IsOptional()
  @IsString()
  search?: string; // cari bdsrkan username, email, firstName, lastName

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsOptional()
  @IsString()
  divisionId?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Role ID must be a positive integer' })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  roleId?: number;
}
