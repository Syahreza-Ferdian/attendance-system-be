import { WorkSchedule, WorkScheduleDay } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserWorkScheduleEntity } from './user.entity';

@Exclude()
export class WorkScheduleEntity implements WorkSchedule {
  @Expose()
  id: string;

  @Expose()
  name: string | null;

  @Expose()
  description: string | null;

  @Expose()
  startTime: string;

  @Expose()
  endTime: string;

  @Expose()
  lateToleranceMinutes: number;

  @Expose({ groups: ['withDay'] })
  @Type(() => WorkScheduleDayEntity)
  workScheduleDays: WorkScheduleDayEntity[];

  @Expose({ groups: ['withUserSchedule'] })
  @Type(() => UserWorkScheduleEntity)
  userWorkSchedules: UserWorkScheduleEntity[];
}

@Exclude()
export class WorkScheduleDayEntity implements WorkScheduleDay {
  @Expose()
  id: string;

  workScheduleId: string;

  @Expose()
  dayOfWeek: number;
}
