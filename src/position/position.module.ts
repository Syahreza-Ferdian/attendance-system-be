import { Module } from '@nestjs/common';
import { PositionController } from './position.controller';
import { PositionService } from './position.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  controllers: [PositionController],
  providers: [PositionService],
  imports: [PrismaModule, PaginationModule],
})
export class PositionModule {}
