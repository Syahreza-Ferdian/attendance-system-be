import { IsOptional, IsString } from 'class-validator';
import { PaginationQuery } from 'src/common/pagination/pagination.query';

export class PositionQuery extends PaginationQuery {
  @IsOptional()
  @IsString()
  search?: string; // cari bdsrkan name

  @IsOptional()
  @IsString()
  divisionId?: string;
}
