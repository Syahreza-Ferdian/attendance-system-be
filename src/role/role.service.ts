import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { RoleEntity } from 'src/common/entity/role.entity';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private prismaService: PrismaService) {}

  async getAllRoles() {
    const roles = await this.prismaService.role.findMany();

    return plainToInstance(RoleEntity, roles, {
      excludeExtraneousValues: true,
    });
  }
}
