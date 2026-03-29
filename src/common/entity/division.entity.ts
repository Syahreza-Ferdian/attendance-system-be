import { Division } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { PositionEntity } from './position.entity';

@Exclude()
export class DivisionEntity implements Division {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string | null;

  @Expose({ groups: ['withPositions'] })
  @Type(() => PositionEntity)
  positions: PositionEntity[];
}
