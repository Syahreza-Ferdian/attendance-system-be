import { Role } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RoleEntity implements Role {
  @Expose()
  id: number;

  @Expose()
  name: string;
}
