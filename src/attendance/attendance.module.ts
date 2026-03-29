import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { UsersModule } from 'src/users/users.module';
import { UploadModule } from 'src/upload/upload.module';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  providers: [AttendanceService],
  controllers: [AttendanceController],
  imports: [UsersModule, UploadModule, PrismaModule, PaginationModule],
  // exports: [AttendanceService],
})
export class AttendanceModule {}
