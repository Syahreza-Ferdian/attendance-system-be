import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQuery } from 'src/common/pagination/pagination.query';

export class PositionQuery extends PaginationQuery {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search term to filter positions by name',
  })
  search?: string; // cari bdsrkan name

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Division ID to filter positions by their division',
  })
  divisionId?: string;
}
