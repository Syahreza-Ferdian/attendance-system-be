import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ResponseMessage } from 'src/common/response/response.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadConfig } from 'src/upload/upload.config';
import { CurrentUser } from 'src/users/users.decorator';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { ForAdmin } from 'src/authorization/authorization.decorator';
import { AttendanceQuery } from './dto/query-attendance.dto';

@Controller({
  path: 'attendance',
  version: '1',
})
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get('all')
  @ForAdmin()
  @ResponseMessage('Successfully retrieved all attendance records')
  async getAllAttendances(@Query() query: AttendanceQuery) {
    return await this.attendanceService.getAllAttendances(query);
  }

  @Post('clock-in')
  @ResponseMessage('Berhasil melakukan absen masuk untuk hari ini')
  @UseInterceptors(FileInterceptor('attendanceProofImage', imageUploadConfig))
  async clockIn(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateAttendanceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Attendance proof image is required.');
    }

    return await this.attendanceService.clockIn(user.sub, dto, file);
  }

  @Post('clock-out')
  @ResponseMessage('Berhasil melakukan absen keluar untuk hari ini')
  @UseInterceptors(FileInterceptor('attendanceProofImage', imageUploadConfig))
  async clockOut(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateAttendanceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Attendance proof image is required.');
    }

    return await this.attendanceService.clockOut(user.sub, dto, file);
  }

  @Get('stats')
  @ForAdmin()
  @ResponseMessage('Successfully retrieved attendance statistics')
  async getAttendanceStats(@Query('date') date: string) {
    return await this.attendanceService.attendanceStatsByDate(date);
  }

  @Get('user/today')
  @ResponseMessage("Sucessfully retrieved user today's attendance records")
  async getTodayAttendance(@CurrentUser() user: { sub: string }) {
    try {
      return await this.attendanceService.getUserTodayAttendance(user.sub);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }
    }
  }

  @Get('user/last-week')
  @ResponseMessage(
    "Successfully retrieved user's attendance records for the last week",
  )
  async getLastWeekAttendance(@CurrentUser() user: { sub: string }) {
    return await this.attendanceService.getUserLastSevenDaysAttendance(
      user.sub,
    );
  }

  @Get('user/stats')
  @ResponseMessage("Successfully retrieved user's attendance statistics")
  async getUserAttendanceStats(@CurrentUser() user: { sub: string }) {
    return await this.attendanceService.getUserAttendanceStats(user.sub);
  }

  @Get(':attendanceId')
  @ForAdmin()
  @ResponseMessage('Successfully retrieved attendance record information')
  async getAttendanceById(@Param('attendanceId') attendanceId: string) {
    return await this.attendanceService.getAttendanceById(attendanceId);
  }
}
