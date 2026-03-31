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
        user: {
          include: {
            position: {
              include: {
                division: true,
              },
            },
          },
        },
      },
      orderBy: {
        workDate: 'desc',
      },
      transform: (attendance) =>
        plainToInstance(AttendanceEntity, attendance, {
          excludeExtraneousValues: true,
          groups: ['withUser', 'withPosition', 'withDivision'],
        }),
    });
  }

  async getAttendanceById(attendanceId: string): Promise<AttendanceEntity> {
    const attendance = await this.prismaService.attendance.findUniqueOrThrow({
      where: { id: attendanceId },
      include: {
        user: {
          include: {
            position: {
              include: {
                division: true,
              },
            },
          },
        },
      },
    });

    return plainToInstance(AttendanceEntity, attendance, {
      excludeExtraneousValues: true,
      groups: ['withUser', 'withPosition', 'withDivision'],
    });
  }

  async attendanceStatsByDate(date: string) {
    const stats = await this.prismaService.attendance.groupBy({
      by: ['status'],
      where: {
        workDate: {
          gte: convertStringToDate(date).startOf('day').toDate(),
          lte: convertStringToDate(date).endOf('day').toDate(),
        },
      },
      _count: {
        status: true,
      },
    });

    const totalEmployees = await this.prismaService.user.count();
    const totalPresent = stats.find(
      (stat) => stat.status === AttendanceStatus.PRESENT,
    )?._count.status;
    const totalLate = stats.find(
      (stat) => stat.status === AttendanceStatus.LATE,
    )?._count.status;

    const presentPercentage =
      totalEmployees && totalPresent
        ? Math.round((totalPresent / totalEmployees) * 100)
        : 0;

    const latePercentage =
      totalEmployees && totalLate
        ? Math.round((totalLate / totalEmployees) * 100)
        : 0;

    const formattedStats = {
      present: 0,
      late: 0,
      totalEmployees,
      presentPercentage,
      latePercentage,
    };

    stats.forEach((stat) => {
      formattedStats[stat.status.toLowerCase()] = stat._count.status;
    });

    return formattedStats;
  }

  async getUserTodayAttendance(userId: string): Promise<AttendanceEntity> {
    const today = convertToISO8601(now());

    const attendance = await this.prismaService.attendance.findUniqueOrThrow({
      where: { userId_workDate: { userId, workDate: today } },
      include: {
        user: {
          include: {
            position: {
              include: {
                division: true,
              },
            },
          },
        },
      },
    });

    return plainToInstance(AttendanceEntity, attendance, {
      excludeExtraneousValues: true,
    });
  }

  async getUserLastSevenDaysAttendance(
    userId: string,
  ): Promise<AttendanceEntity[]> {
    const today = now();

    const startDate = today.subtract(6, 'day').startOf('day').toDate();
    const endDate = today.endOf('day').toDate();

    const attendances = await this.prismaService.attendance.findMany({
      where: {
        userId,
        workDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        workDate: 'asc',
      },
    });

    return attendances.map((attendance) =>
      plainToInstance(AttendanceEntity, attendance, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async getUserAttendanceStats(userId: string) {
    const today = now();

    const startOfThisMonth = today.startOf('month').toDate();
    const endOfThisMonth = today.endOf('month').toDate();

    const startOfLastMonth = today
      .subtract(1, 'month')
      .startOf('month')
      .toDate();

    const endOfLastMonth = today.subtract(1, 'month').endOf('month').toDate();

    const [thisMonthStats, lastMonthStats] = await Promise.all([
      this.prismaService.attendance.groupBy({
        by: ['status'],
        where: {
          userId,
          workDate: {
            gte: startOfThisMonth,
            lte: endOfThisMonth,
          },
        },
        _count: {
          status: true,
        },
      }),
      this.prismaService.attendance.groupBy({
        by: ['status'],
        where: {
          userId,
          workDate: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        _count: {
          status: true,
        },
      }),
    ]);

    const formattedStats = {
      presentThisMonth: 0,
      lateThisMonth: 0,
      presentLastMonth: 0,
      lateLastMonth: 0,
    };

    thisMonthStats.forEach((stat) => {
      if (stat.status === AttendanceStatus.PRESENT) {
        formattedStats.presentThisMonth = stat._count.status;
      }
      if (stat.status === AttendanceStatus.LATE) {
        formattedStats.lateThisMonth = stat._count.status;
      }
    });

    lastMonthStats.forEach((stat) => {
      if (stat.status === AttendanceStatus.PRESENT) {
        formattedStats.presentLastMonth = stat._count.status;
      }
      if (stat.status === AttendanceStatus.LATE) {
        formattedStats.lateLastMonth = stat._count.status;
      }
    });

    return formattedStats;
  }
}
