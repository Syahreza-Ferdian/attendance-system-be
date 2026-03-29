import { User, UserWorkSchedule } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { RoleEntity } from './role.entity';
import { WorkScheduleEntity } from './work-schedule.entity';
import { PositionEntity } from './position.entity';

@Exclude()
export class UserEntity implements User {
  roleId: number;
  positionId: string;
  password: string;

  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  // @Transform(({ value }) =>
  //   value ? `${process.env.APP_URL}/api${value}` : null,
  // )
  profileImage: string | null;

  @Expose({ groups: ['withRole'] })
  @Type(() => RoleEntity)
  role: RoleEntity;

  @Expose({ groups: ['withPosition'] })
  @Type(() => PositionEntity)
  position: PositionEntity;

  @Expose({ groups: ['withWorkSchedule'] })
  @Type(() => UserWorkScheduleEntity)
  userWorkSchedules: UserWorkScheduleEntity[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

@Exclude()
export class UserWorkScheduleEntity implements UserWorkSchedule {
  @Expose()
  id: string;

  // @Expose()
  userId: string;

  //   @Expose()
  workScheduleId: string;

  @Expose({ groups: ['withWorkSchedule'] })
  @Type(() => WorkScheduleEntity)
  workSchedule: WorkScheduleEntity;

  @Expose({ groups: ['withUser'] })
  @Type(() => UserEntity)
  user: UserEntity;
}
