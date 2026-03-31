import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Latitude and longitude of the attendance location, separated by a comma (e.g., "latitude,longitude")',
  })
  location: string;
}
