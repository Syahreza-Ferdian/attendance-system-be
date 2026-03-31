import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';

@Module({
  controllers: [RoleController],
  providers: [RoleService],
  imports: [PrismaModule],
})
export class RoleModule {}
