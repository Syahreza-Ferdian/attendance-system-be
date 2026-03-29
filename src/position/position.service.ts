import { BadRequestException, Injectable } from '@nestjs/common';
import { PaginationResponse } from 'src/common/pagination/pagination.interface';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { PositionQuery } from './dto/query-position.dto';
import { PositionEntity } from 'src/common/entity/position.entity';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionService {
  constructor(
    private prismaService: PrismaService,
    private paginationService: PaginationService,
  ) {}

  async getAllPositions(
    query: PositionQuery,
  ): Promise<PaginationResponse<PositionEntity>> {
    const { divisionId, search } = query;

    const where: Prisma.PositionWhereInput = {
      ...(search && { name: { contains: search } }),
      ...(divisionId && { divisionId }),
    };

    return this.paginationService.paginate<PositionEntity>({
      modelDelegate: this.prismaService.position,
      query,
      where,
      include: {
        division: true,
      },
      transform: (position) =>
        plainToInstance(PositionEntity, position, {
          excludeExtraneousValues: true,
          groups: ['withDivision'],
        }),
    });
  }

  async getPositionById(positionId: string): Promise<PositionEntity> {
    const position = await this.prismaService.position.findUniqueOrThrow({
      where: { id: positionId },
      include: {
        division: true,
      },
    });

    return plainToInstance(PositionEntity, position, {
      excludeExtraneousValues: true,
      groups: ['withDivision'],
    });
  }

  async createPosition(dto: CreatePositionDto): Promise<PositionEntity> {
    const position = await this.prismaService.position.create({
      data: dto,
      include: {
        division: true,
      },
    });

    return plainToInstance(PositionEntity, position, {
      excludeExtraneousValues: true,
      groups: ['withDivision'],
    });
  }

  async updatePosition(
    positionId: string,
    dto: UpdatePositionDto,
  ): Promise<PositionEntity> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('No data provided for update');
    }

    const updatedPosition = await this.prismaService.position.update({
      where: { id: positionId },
      data: dto,
      include: {
        division: true,
      },
    });

    return plainToInstance(PositionEntity, updatedPosition, {
      excludeExtraneousValues: true,
      groups: ['withDivision'],
    });
  }

  async deletePosition(positionId: string): Promise<void> {
    await this.prismaService.position.delete({
      where: { id: positionId },
    });
  }
}
