import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { AttendanceStatus, Prisma } from '@prisma/client';
import { AttendanceEntity } from 'src/common/entity/attendance.entity';
import { plainToInstance } from 'class-transformer';
import {
  convertStringToDate,
  convertToISO8601,
  now,
  toDate,
} from 'src/common/helpers/datetime.helper';
import { AttendanceQuery } from './dto/query-attendance.dto';
import { PaginationResponse } from 'src/common/pagination/pagination.interface';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Injectable()
export class AttendanceService {
  constructor(
    private prismaService: PrismaService,
    private uploadService: UploadService,
    private paginationService: PaginationService,
  ) {}

  async clockIn(
    userId: string,
    dto: CreateAttendanceDto,
    file: Express.Multer.File,
  ): Promise<AttendanceEntity> {
    const currentTime = now();
    const currentTimeInUTC = currentTime.utc();
    const todayOfWeek = currentTime.day();

    // console.log('currentTime:', currentTime.format('YYYY-MM-DD HH:mm:ss'));
    // console.log('workDate:', workDate);
    // console.log('todayOfWeek:', todayOfWeek);
    // console.log('startOfDay:', currentTime.utc().startOf('day').toDate());
    // console.log('endOfDay:', currentTime.utc().endOf('day').toDate());

    // cek udah absen masuk apa blm
    const existing = await this.prismaService.attendance.findFirst({
      where: {
        userId,
        workDate: {
          gte: currentTimeInUTC.startOf('day').toDate(),
          lte: currentTimeInUTC.endOf('day').toDate(),
        },
      },
    });
    if (existing) {
      throw new BadRequestException('You have already clocked in for today.');
    }

    // cek ada jadwal kerja ato ngk hari ini
    const userSchedule = await this.prismaService.userWorkSchedule.findFirst({
      where: {
        userId,
        workSchedule: {
          workScheduleDays: {
            some: { dayOfWeek: todayOfWeek },
          },
        },
      },
      include: {
        workSchedule: true,
      },
    });

    if (!userSchedule) {
      throw new BadRequestException(
        'You do not have a work schedule for today.',
      );
    }

    // tentukan status absen
    const { lateToleranceMinutes, startTime } = userSchedule.workSchedule;
    const [startHour, startMinute] = startTime.split(':').map(Number);

    const scheduleStart = currentTime
      .hour(startHour)
      .minute(startMinute)
      .second(0)
      .millisecond(0);

    const toleranceDeadline = scheduleStart.add(lateToleranceMinutes, 'minute');

    const status: AttendanceStatus =
      currentTime.isBefore(toleranceDeadline) ||
      currentTime.isSame(toleranceDeadline)
        ? AttendanceStatus.PRESENT
        : AttendanceStatus.LATE;

    // upload bukti absensi
    const attendanceProofImagePath = await this.uploadService.compressAndSave(
      file,
      'attendances',
      'clockIn',
    );

    try {
      const newAttendance = await this.prismaService.attendance.create({
        data: {
          userId,
          workDate: currentTimeInUTC.startOf('day').toDate(),
          locationIn: dto.location,
          proofImageIn: attendanceProofImagePath,
          attendanceIn: toDate(currentTime),
          status,
        },
      });

      return plainToInstance(AttendanceEntity, newAttendance, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      await this.uploadService.deleteFile(attendanceProofImagePath);
      throw error;
    }
  }

  async clockOut(
    userId: string,
    dto: CreateAttendanceDto,
    file: Express.Multer.File,
  ): Promise<AttendanceEntity> {
    const currentTime = now();
    const workDate = convertToISO8601(currentTime);

    // cek udh absen masuk hari ini apa blm
    const todayAttendance = await this.prismaService.attendance.findUnique({
      where: { userId_workDate: { userId, workDate } },
    });

    if (!todayAttendance) {
      throw new BadRequestException('You have not clocked in for today.');
    }

    if (todayAttendance.attendanceOut) {
      throw new BadRequestException('You have already clocked out for today.');
    }

    const attendanceProofImagePath = await this.uploadService.compressAndSave(
      file,
      'attendances',
      'clockOut',
    );

    try {
      const updatedAttendance = await this.prismaService.attendance.update({
        where: { id: todayAttendance.id },
        data: {
          attendanceOut: toDate(currentTime),
          proofImageOut: attendanceProofImagePath,
          locationOut: dto.location,
        },
      });

      return plainToInstance(AttendanceEntity, updatedAttendance, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      await this.uploadService.deleteFile(attendanceProofImagePath);
      throw error;
    }
  }

  async getAllAttendances(
    query: AttendanceQuery,
  ): Promise<PaginationResponse<AttendanceEntity>> {
    const { search, divisionId, roleId, positionId, status, workDate } = query;

    const where: Prisma.AttendanceWhereInput = {
      ...(status ? { status } : {}),
      ...(workDate
        ? {
            workDate: {
              gte: convertStringToDate(workDate).startOf('day').toDate(),
              lte: convertStringToDate(workDate).endOf('day').toDate(),
            },
          }
        : {}),
      user: {
        ...(search && {
          OR: [
            { username: { contains: search } },
            { email: { contains: search } },
            { firstName: { contains: search } },
            { lastName: { contains: search } },
          ],
        }),
        ...(roleId ? { roleId } : {}),
        ...(divisionId ? { divisionId } : {}),
        ...(positionId ? { positionId } : {}),
      },
    };

    // console.log(
    //   'AttendanceService.getAllAttendances - where clause:',
    //   JSON.stringify(where, null, 2),
    // );

    return this.paginationService.paginate<AttendanceEntity>({
      modelDelegate: this.prismaService.attendance,
      query,
      where,
      include: {
        user: true,
      },
      transform: (attendance) =>
        plainToInstance(AttendanceEntity, attendance, {
          excludeExtraneousValues: true,
          groups: ['withUser'],
        }),
    });
  }
}
