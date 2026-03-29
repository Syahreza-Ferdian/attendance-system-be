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

@Controller({
  path: 'divisions',
  version: '1',
})
export class DivisionController {
  constructor(private divisionService: DivisionService) {}

  @Get()
  @ForAdmin()
  @ResponseMessage('Successfully retrieved all divisions')
  async getAllDivisions(@Query() query: DivisionQuery) {
    return await this.divisionService.getAllDivisions(query);
  }

  @Get(':id')
  @ForAdmin()
  @ResponseMessage('Successfully retrieved division information')
  async getDivisionById(@Param('id') divisionId: string) {
    return await this.divisionService.getDivisionById(divisionId);
  }

  @Post()
  @ForAdmin()
  @UseInterceptors(NoFilesInterceptor())
  @ResponseMessage('Successfully created division')
  async createDivision(@Body() dto: CreateDivisionDto) {
    return await this.divisionService.createDivision(dto);
  }

  @Patch(':id')
  @ForAdmin()
  @UseInterceptors(NoFilesInterceptor())
  @ResponseMessage('Successfully updated division')
  async updateDivision(
    @Param('id') divisionId: string,
    @Body() dto: UpdateDivisionDto,
  ) {
    return await this.divisionService.updateDivision(divisionId, dto);
  }

  @Delete(':id')
  @ForAdmin()
  @ResponseMessage('Successfully deleted division')
  async deleteDivision(@Param('id') divisionId: string) {
    await this.divisionService.deleteDivision(divisionId);
  }
}
