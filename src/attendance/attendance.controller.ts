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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller({
  path: 'attendance',
  version: '1',
})
@ApiBearerAuth()
@ApiTags('Attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get('all')
  @ForAdmin()
  @ResponseMessage('Successfully retrieved all attendance records')
  @ApiOperation({
    summary: 'Get all attendance records with pagination and optional search',
  })
  @ApiResponse({
    status: 200,
    description: 'List of attendance records',
  })
  async getAllAttendances(@Query() query: AttendanceQuery) {
    return await this.attendanceService.getAllAttendances(query);
  }

  @Post('clock-in')
  @ResponseMessage('Berhasil melakukan absen masuk untuk hari ini')
  @UseInterceptors(FileInterceptor('attendanceProofImage', imageUploadConfig))
  @ApiOperation({
    summary: 'Clock in for attendance with proof image',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully clocked in for attendance.',
  })
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
  @ApiOperation({
    summary: 'Clock out for attendance with proof image',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully clocked out for attendance.',
  })
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
  @ApiOperation({
    summary: 'Get attendance statistics for a specific date',
  })
  @ApiResponse({
    status: 200,
    description: 'List of attendance statistics',
  })
  async getAttendanceStats(@Query('date') date: string) {
    return await this.attendanceService.attendanceStatsByDate(date);
  }

  @Get('user/today')
  @ResponseMessage("Sucessfully retrieved user today's attendance records")
  @ApiOperation({
    summary: "Get user's attendance records for today",
  })
  @ApiResponse({
    status: 200,
    description: "List of user's attendance records for today",
  })
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
  @ApiOperation({
    summary: "Get user's attendance records for the last 7 days",
  })
  @ApiResponse({
    status: 200,
    description: "List of user's attendance records for the last 7 days",
  })
  async getLastWeekAttendance(@CurrentUser() user: { sub: string }) {
    return await this.attendanceService.getUserLastSevenDaysAttendance(
      user.sub,
    );
  }

  @Get('user/stats')
  @ResponseMessage("Successfully retrieved user's attendance statistics")
  @ApiOperation({
    summary: "Get user's attendance statistics",
  })
  @ApiResponse({
    status: 200,
    description: "User's attendance statistics",
  })
  async getUserAttendanceStats(@CurrentUser() user: { sub: string }) {
    return await this.attendanceService.getUserAttendanceStats(user.sub);
  }

  @Get(':attendanceId')
  @ForAdmin()
  @ResponseMessage('Successfully retrieved attendance record information')
  @ApiOperation({
    summary: 'Get attendance record information by ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Attendance record not found',
  })
  async getAttendanceById(@Param('attendanceId') attendanceId: string) {
    return await this.attendanceService.getAttendanceById(attendanceId);
  }
}
