import { BadRequestException, Injectable } from '@nestjs/common';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { WorkScheduleQuery } from './dto/query-work_schedule.dto';
import { WorkScheduleEntity } from 'src/common/entity/work-schedule.entity';
import { Prisma } from '@prisma/client';
import { PaginationResponse } from 'src/common/pagination/pagination.interface';
import { plainToInstance } from 'class-transformer';
import { CreateWorkScheduleDto } from './dto/create-work_schedule.dto';
import { UpdateWorkScheduleDto } from './dto/update-work_schedule.dto';

// TODO: BUAT SERVICE UNTUK ASSIGN WORK SCHEDULE KE USER

@Injectable()
export class WorkScheduleService {
  constructor(
    private prismaService: PrismaService,
    private paginationService: PaginationService,
  ) {}

  async getAllWorkSchedules(
    query: WorkScheduleQuery,
  ): Promise<PaginationResponse<WorkScheduleEntity>> {
    const { search } = query;

    const where: Prisma.WorkScheduleWhereInput = {
      ...(search && { name: { contains: search } }),
    };

    return this.paginationService.paginate<WorkScheduleEntity>({
      modelDelegate: this.prismaService.workSchedule,
      query,
      where,
      include: {
        workScheduleDays: true,
        // userWorkSchedules: true,
      },
      transform: (workSchedule) =>
        plainToInstance(WorkScheduleEntity, workSchedule, {
          excludeExtraneousValues: true,
          groups: ['withDay'],
        }),
    });
  }

  async getWorkScheduleById(
    workScheduleId: string,
  ): Promise<WorkScheduleEntity> {
    const workSchedule =
      await this.prismaService.workSchedule.findUniqueOrThrow({
        where: { id: workScheduleId },
        include: {
          workScheduleDays: true,
          userWorkSchedules: {
            include: {
              user: true,
            },
          },
        },
      });

    return plainToInstance(WorkScheduleEntity, workSchedule, {
      excludeExtraneousValues: true,
      groups: ['withDay', 'withUserSchedule', 'withUser'],
    });
  }

  async createWorkSchedule(
    dto: CreateWorkScheduleDto,
  ): Promise<WorkScheduleEntity> {
    const { workScheduleDays, ...workScheduleData } = dto;

    if (workScheduleDays.length === 0) {
      throw new BadRequestException(
        'At least one work schedule day must be provided',
      );
    }

    const workSchedule = await this.prismaService.workSchedule.create({
      data: {
        ...workScheduleData,
        workScheduleDays: {
          create: workScheduleDays.map((day) => ({
            dayOfWeek: day,
          })),
        },
      },
      include: {
        workScheduleDays: true,
      },
    });

    // const workSchedule = await this.prismaService.workSchedule.create({
    //   data: dto,
    // });
    return plainToInstance(WorkScheduleEntity, workSchedule, {
      excludeExtraneousValues: true,
      groups: ['withDay'],
    });
  }

  async updateWorkSchedule(
    workScheduleId: string,
    dto: UpdateWorkScheduleDto,
  ): Promise<WorkScheduleEntity> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('No data provided for update');
    }

    const { workScheduleDays, ...workScheduleData } = dto;

    const updatedWorkSchedule = await this.prismaService.workSchedule.update({
      where: { id: workScheduleId },
      data: {
        ...workScheduleData,
        ...(workScheduleDays && {
          workScheduleDays: {
            deleteMany: {},
            create: workScheduleDays.map((day) => ({ dayOfWeek: day })),
          },
        }),
      },
      include: {
        workScheduleDays: true,
      },
    });

    return plainToInstance(WorkScheduleEntity, updatedWorkSchedule, {
      excludeExtraneousValues: true,
      groups: ['withDay'],
    });
  }

  async deleteWorkSchedule(workScheduleId: string): Promise<void> {
    await this.prismaService.workSchedule.delete({
      where: { id: workScheduleId },
    });
  }
}
