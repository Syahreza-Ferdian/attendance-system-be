import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './authentication/authentication.guard';
import { AuthorizationModule } from './authorization/authorization.module';
import { AuthorizationGuard } from './authorization/authorization.guard';
import { UploadModule } from './upload/upload.module';
import { PaginationService } from './common/pagination/pagination.service';
import { PaginationModule } from './common/pagination/pagination.module';
import { AttendanceModule } from './attendance/attendance.module';
import { DivisionModule } from './division/division.module';
import { PositionModule } from './position/position.module';
import { WorkScheduleModule } from './work_schedule/work_schedule.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [
    AuthenticationModule,
    UsersModule,
    PrismaModule,
    AuthorizationModule,
    UploadModule,
    PaginationModule,
    AttendanceModule,
    DivisionModule,
    PositionModule,
    WorkScheduleModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
    PaginationService,
  ],
})
export class AppModule {}
