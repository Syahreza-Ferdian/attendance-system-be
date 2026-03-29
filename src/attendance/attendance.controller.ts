import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
}
