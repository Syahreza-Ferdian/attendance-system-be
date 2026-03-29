import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationQuery {
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Page value cannot go below 1' })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Limit value cannot go below 1' })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  limit?: number = 10;
}
