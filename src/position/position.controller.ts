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
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller({
  path: 'positions',
  version: '1',
})
@ApiBearerAuth()
export class PositionController {
  constructor(private positionService: PositionService) {}

  @Get()
  @ForAdmin()
  @ResponseMessage('Successfully retrieved all positions')
  @ApiOperation({
    summary: 'Get all positions with pagination and optional search',
  })
  @ApiResponse({
    status: 200,
    description: 'List of positions',
  })
  async getAllPositions(@Query() query: PositionQuery) {
    return await this.positionService.getAllPositions(query);
  }

  @Get(':id')
  @ForAdmin()
  @ResponseMessage('Seccessfully retrieved position information')
  @ApiOperation({
    summary: 'Get position information by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Position information',
  })
  async getPositionById(@Param('id') positionId: string) {
    return await this.positionService.getPositionById(positionId);
  }

  @Post()
  @ForAdmin()
  @UseInterceptors(NoFilesInterceptor())
  @ResponseMessage('Successfully created position')
  @ApiOperation({
    summary: 'Create a new position',
  })
  @ApiResponse({
    status: 201,
    description: 'The position has been successfully created.',
  })
  async createPosition(@Body() dto: CreatePositionDto) {
    return await this.positionService.createPosition(dto);
  }

  @Patch(':id')
  @ForAdmin()
  @UseInterceptors(NoFilesInterceptor())
  @ResponseMessage('Successfully updated position')
  @ApiOperation({
    summary: 'Update position information',
  })
  @ApiResponse({
    status: 200,
    description: 'The position has been successfully updated.',
  })
  async updatePosition(
    @Param('id') positionId: string,
    @Body() dto: UpdatePositionDto,
  ) {
    return await this.positionService.updatePosition(positionId, dto);
  }

  @Delete(':id')
  @ForAdmin()
  @ResponseMessage('Successfully deleted position')
  @ApiOperation({
    summary: 'Delete a position by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'The position has been successfully deleted.',
  })
  async deletePosition(@Param('id') positionId: string) {
    await this.positionService.deletePosition(positionId);
  }
}
