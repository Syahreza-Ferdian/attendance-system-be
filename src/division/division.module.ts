import { Module } from '@nestjs/common';
import { DivisionService } from './division.service';
import { DivisionController } from './division.controller';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  providers: [DivisionService],
  controllers: [DivisionController],
  imports: [PrismaModule, PaginationModule],
})
export class DivisionModule {}
