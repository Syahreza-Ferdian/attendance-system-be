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
import { DivisionService } from './division.service';
import { ForAdmin } from 'src/authorization/authorization.decorator';
import { DivisionQuery } from './dto/query-division.dto';
import { ResponseMessage } from 'src/common/response/response.decorator';
import { CreateDivisionDto } from './dto/create-division.dto';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { UpdateDivisionDto } from './dto/update-division.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller({
  path: 'divisions',
  version: '1',
})
@ApiBearerAuth()
@ApiTags('Divisions')
export class DivisionController {
  constructor(private divisionService: DivisionService) {}

  @Get()
  @ForAdmin()
  @ResponseMessage('Successfully retrieved all divisions')
  @ApiOperation({
    summary: 'Get all divisions with pagination and optional search',
  })
  @ApiResponse({
    status: 200,
    description: 'List of divisions',
  })
  async getAllDivisions(@Query() query: DivisionQuery) {
    return await this.divisionService.getAllDivisions(query);
  }

  @Get(':id')
  @ForAdmin()
  @ResponseMessage('Successfully retrieved division information')
  @ApiOperation({
    summary: 'Get division information by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Division information',
  })
  async getDivisionById(@Param('id') divisionId: string) {
    return await this.divisionService.getDivisionById(divisionId);
  }

  @Post()
  @ForAdmin()
  @UseInterceptors(NoFilesInterceptor())
  @ResponseMessage('Successfully created division')
  @ApiOperation({
    summary: 'Create a new division',
  })
  @ApiResponse({
    status: 201,
    description: 'The division has been successfully created.',
  })
  async createDivision(@Body() dto: CreateDivisionDto) {
    return await this.divisionService.createDivision(dto);
  }

  @Patch(':id')
  @ForAdmin()
  @UseInterceptors(NoFilesInterceptor())
  @ResponseMessage('Successfully updated division')
  @ApiOperation({
    summary: 'Update division information',
  })
  @ApiResponse({
    status: 200,
    description: 'The division has been successfully updated.',
  })
  async updateDivision(
    @Param('id') divisionId: string,
    @Body() dto: UpdateDivisionDto,
  ) {
    return await this.divisionService.updateDivision(divisionId, dto);
  }

  @Delete(':id')
  @ForAdmin()
  @ResponseMessage('Successfully deleted division')
  @ApiOperation({
    summary: 'Delete a division by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'The division has been successfully deleted.',
  })
  async deleteDivision(@Param('id') divisionId: string) {
    await this.divisionService.deleteDivision(divisionId);
  }
}
