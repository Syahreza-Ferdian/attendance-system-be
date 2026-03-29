import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { PositionService } from './position.service';
import { ForAdmin } from 'src/authorization/authorization.decorator';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { ResponseMessage } from 'src/common/response/response.decorator';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionQuery } from './dto/query-position.dto';

@Controller({
  path: 'positions',
  version: '1',
})
export class PositionController {
  constructor(private positionService: PositionService) {}

  @Get()
  @ForAdmin()
  @ResponseMessage('Successfully retrieved all positions')
  async getAllPositions(@Query() query: PositionQuery) {
    return await this.positionService.getAllPositions(query);
  }

  @Get(':id')
  @ForAdmin()
  @ResponseMessage('Seccessfully retrieved position information')
  async getPositionById(@Param('id') positionId: string) {
    return await this.positionService.getPositionById(positionId);
  }

  @Post()
  @ForAdmin()
  @UseInterceptors(NoFilesInterceptor())
  @ResponseMessage('Successfully created position')
  async createPosition(@Body() dto: CreatePositionDto) {
    return await this.positionService.createPosition(dto);
  }

  @Patch(':id')
  @ForAdmin()
  @UseInterceptors(NoFilesInterceptor())
  @ResponseMessage('Successfully updated position')
  async updatePosition(
    @Param('id') positionId: string,
    @Body() dto: UpdatePositionDto,
  ) {
    return await this.positionService.updatePosition(positionId, dto);
  }

  @Delete(':id')
  @ForAdmin()
  @ResponseMessage('Successfully deleted position')
  async deletePosition(@Param('id') positionId: string) {
    await this.positionService.deletePosition(positionId);
  }
}
