import { Position } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { DivisionEntity } from './division.entity';

@Exclude()
export class PositionEntity implements Position {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string | null;

  @Expose()
  divisionId: string;

  @Expose({ groups: ['withDivision'] })
  @Type(() => DivisionEntity)
  division: DivisionEntity;
}
