import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { UploadModule } from 'src/upload/upload.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [PrismaModule, UploadModule, PaginationModule],
  exports: [UsersService],
})
export class UsersModule {}
