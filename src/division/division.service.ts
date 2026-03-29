import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DivisionQuery } from './dto/query-division.dto';
import { PaginationResponse } from 'src/common/pagination/pagination.interface';
import { DivisionEntity } from 'src/common/entity/division.entity';
import { Prisma } from '@prisma/client';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { plainToInstance } from 'class-transformer';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';

@Injectable()
export class DivisionService {
  constructor(
    private prismaService: PrismaService,
    private paginationService: PaginationService,
  ) {}

  async getAllDivisions(
    query: DivisionQuery,
  ): Promise<PaginationResponse<DivisionEntity>> {
    const { search } = query;

    const where: Prisma.DivisionWhereInput = {
      ...(search && { name: { contains: search } }),
    };

    return this.paginationService.paginate<DivisionEntity>({
      modelDelegate: this.prismaService.division,
      query,
      where,
      include: {
        positions: true,
      },
      transform: (division) =>
        plainToInstance(DivisionEntity, division, {
          excludeExtraneousValues: true,
          groups: ['withPositions'],
        }),
    });
  }

  async getDivisionById(divisionId: string): Promise<DivisionEntity> {
    const division = await this.prismaService.division.findUniqueOrThrow({
      where: { id: divisionId },
      include: {
        positions: true,
      },
    });

    return plainToInstance(DivisionEntity, division, {
      excludeExtraneousValues: true,
      groups: ['withPositions'],
    });
  }

  async createDivision(dto: CreateDivisionDto): Promise<DivisionEntity> {
    const division = await this.prismaService.division.create({
      data: dto,
    });

    return plainToInstance(DivisionEntity, division, {
      excludeExtraneousValues: true,
    });
  }

  async updateDivision(
    divisionId: string,
    dto: UpdateDivisionDto,
  ): Promise<DivisionEntity> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('No data provided for update');
    }

    const division = await this.prismaService.division.update({
      where: { id: divisionId },
      data: dto,
    });

    return plainToInstance(DivisionEntity, division, {
      excludeExtraneousValues: true,
    });
  }

  async deleteDivision(divisionId: string): Promise<void> {
    await this.prismaService.division.delete({
      where: { id: divisionId },
    });
  }
}
