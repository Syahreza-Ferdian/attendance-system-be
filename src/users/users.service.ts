import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from 'src/common/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { UserQuery } from './dto/query-user.dto';
import { PaginationResponse } from 'src/common/pagination/pagination.interface';
import { Prisma } from '@prisma/client';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private paginationService: PaginationService,
    private uploadService: UploadService,
  ) {}

  async findUserDynamic(
    query: {
      userId?: string;
      username?: string;
      email?: string;
    },
    includeHashedPasswordOnResponse = false,
    relationsToInclude?: string[],
  ): Promise<{ user: UserEntity; hashedPassword?: string }> {
    const { userId, username, email } = query;

    if (!userId && !username && !email) {
      throw new NotFoundException('No valid query parameters provided');
    }

    const orClause = [
      userId ? { id: userId } : null,
      username ? { username } : null,
      email ? { email } : null,
    ].filter((x) => x !== null);

    const user = await this.prismaService.user.findFirst({
      where: {
        OR: orClause,
      },
      include: {
        role: relationsToInclude?.includes('withRole') ?? false,
        position: relationsToInclude?.includes('withPosition') ?? false,
        userWorkSchedules: {
          include: {
            workSchedule: {
              include: {
                workScheduleDays:
                  relationsToInclude?.includes('withWorkSchedule') ?? false,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: plainToInstance(UserEntity, user, {
        excludeExtraneousValues: true,
        groups:
          relationsToInclude && relationsToInclude.length > 0
            ? relationsToInclude
            : undefined,
      }),

      hashedPassword: includeHashedPasswordOnResponse
        ? user.password
        : undefined,
    };
  }

  async getAllUsers(query: UserQuery): Promise<PaginationResponse<UserEntity>> {
    const { search, divisionId, roleId, positionId } = query;

    const where: Prisma.UserWhereInput = {
      ...(search && {
        OR: [
          { username: { contains: search } },
          { email: { contains: search } },
          { firstName: { contains: search } },
          { lastName: { contains: search } },
        ],
      }),
      ...(roleId ? { roleId } : {}),
      ...(positionId ? { positionId } : {}),
      ...(divisionId ? { position: { divisionId } } : {}),
    };

    return this.paginationService.paginate<UserEntity>({
      modelDelegate: this.prismaService.user,
      query,
      where,
      include: {
        role: true,
        position: true,
        userWorkSchedules: {
          include: {
            workSchedule: true,
          },
        },
      },
      transform: (user) =>
        plainToInstance(UserEntity, user, {
          excludeExtraneousValues: true,
          groups: ['withRole', 'withPosition', 'withWorkSchedule'],
        }),
    });
  }

  async createUser(
    user: CreateUserDto,
    profilePictureFile?: Express.Multer.File,
  ): Promise<UserEntity> {
    let imagePath: string | undefined;

    if (profilePictureFile) {
      imagePath = await this.uploadService.compressAndSave(
        profilePictureFile,
        'profiles',
      );
    }

    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const createdUser = await this.prismaService.user.create({
        data: {
          ...user,
          password: hashedPassword,
          ...(imagePath ? { profileImage: imagePath } : {}),
        },
        include: {
          role: true,
          position: true,
        },
      });

      return plainToInstance(UserEntity, createdUser, {
        excludeExtraneousValues: true,
        groups: ['withRole', 'withPosition'],
      });
    } catch (error) {
      if (imagePath) {
        await this.uploadService.deleteFile(imagePath);
      }

      throw error;
    }
  }

  async updateUser(
    id: string,
    userData: UpdateUserDto,
    profilePictureFile?: Express.Multer.File,
  ): Promise<UserEntity> {
    if (Object.keys(userData).length === 0 && !profilePictureFile) {
      throw new NotFoundException('No data provided for update');
    }

    let imagePath: string | undefined;
    let oldImagePath: string | undefined;

    if (profilePictureFile) {
      const existingUser = await this.findUserDynamic({ userId: id });
      oldImagePath = existingUser.user.profileImage ?? undefined;

      imagePath = await this.uploadService.compressAndSave(
        profilePictureFile,
        'profiles',
      );
    }

    try {
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id },
        data: {
          ...userData,
          ...(imagePath ? { profileImage: imagePath } : {}),
        },
        include: {
          role: true,
          position: true,
        },
      });

      if (oldImagePath) {
        await this.uploadService.deleteFile(oldImagePath);
      }

      return plainToInstance(UserEntity, updatedUser, {
        excludeExtraneousValues: true,
        groups: ['withRole', 'withPosition'],
      });
    } catch (error) {
      if (imagePath) {
        await this.uploadService.deleteFile(imagePath);
      }

      throw error;
    }
  }

  async deleteProfilePicture(id: string): Promise<UserEntity> {
    const user = await this.findUserDynamic({ userId: id });

    if (!user.user.profileImage) {
      throw new NotFoundException(
        'User does not have a profile picture to delete',
      );
    }

    await this.uploadService.deleteFile(user.user.profileImage);

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: { profileImage: null },
      include: {
        role: true,
        position: true,
      },
    });

    return plainToInstance(UserEntity, updatedUser, {
      excludeExtraneousValues: true,
      groups: ['withRole', 'withPosition'],
    });
  }

  // async assignWorkSchedule()
}
