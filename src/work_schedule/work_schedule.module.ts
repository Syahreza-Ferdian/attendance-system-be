import { Module } from '@nestjs/common';
import { WorkScheduleController } from './work_schedule.controller';
import { WorkScheduleService } from './work_schedule.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  controllers: [WorkScheduleController],
  providers: [WorkScheduleService],
  imports: [PrismaModule, PaginationModule],
})
export class WorkScheduleModule {}
