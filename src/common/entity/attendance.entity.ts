import { $Enums, Attendance } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserEntity } from './user.entity';

@Exclude()
export class AttendanceEntity implements Attendance {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  status: $Enums.AttendanceStatus;

  @Expose()
  workDate: Date;

  @Expose()
  locationIn: string;

  @Expose()
  locationOut: string;

  @Expose()
  proofImageIn: string;

  @Expose()
  proofImageOut: string;

  @Expose()
  attendanceIn: Date;

  @Expose()
  attendanceOut: Date | null;

  @Expose({ groups: ['withUser'] })
  @Type(() => UserEntity)
  user: UserEntity;
}
