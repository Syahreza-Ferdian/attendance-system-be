import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQuery } from 'src/common/pagination/pagination.query';

export class DivisionQuery extends PaginationQuery {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search term to filter divisions by name',
  })
  search?: string; // cari bdsrkan name
}
