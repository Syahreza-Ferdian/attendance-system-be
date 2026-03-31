import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQuery } from 'src/common/pagination/pagination.query';

export class WorkScheduleQuery extends PaginationQuery {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search term to filter work schedules by name',
    example: 'Regular Weekday Schedule',
  })
  search?: string; // cari bdsrkan name
}
