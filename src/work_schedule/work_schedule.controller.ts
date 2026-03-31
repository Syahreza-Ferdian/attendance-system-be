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
import { WorkScheduleService } from './work_schedule.service';
import { ForAdmin } from 'src/authorization/authorization.decorator';
import { ResponseMessage } from 'src/common/response/response.decorator';
import { WorkScheduleQuery } from './dto/query-work_schedule.dto';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { CreateWorkScheduleDto } from './dto/create-work_schedule.dto';
import { UpdateWorkScheduleDto } from './dto/update-work_schedule.dto';
import { AssignWorkScheduleDto } from './dto/assign-work_schedule.dto';

@Controller({
  path: 'work-schedules',
  version: '1',
})
export class WorkScheduleController {
  constructor(private workScheduleService: WorkScheduleService) {}

  @Get()
  @ForAdmin()
  @ResponseMessage('Successfully retrieved all work schedules')
  async getAllWorkSchedules(@Query() query: WorkScheduleQuery) {
    return await this.workScheduleService.getAllWorkSchedules(query);
  }

  @Get(':id')
  @ForAdmin()
  @ResponseMessage('Successfully retrieved work schedule information')
  async getWorkScheduleById(@Param('id') workScheduleId: string) {
    return await this.workScheduleService.getWorkScheduleById(workScheduleId);
  }

  @Post()
  @ForAdmin()
  @ResponseMessage('Successfully created work schedule')
  @UseInterceptors(NoFilesInterceptor())
  async createWorkSchedule(@Body() dto: CreateWorkScheduleDto) {
    return await this.workScheduleService.createWorkSchedule(dto);
  }

  @Patch(':id')
  @ForAdmin()
  @UseInterceptors(NoFilesInterceptor())
  @ResponseMessage('Successfully updated work schedule')
  async updateWorkSchedule(
    @Param('id') workScheduleId: string,
    @Body() dto: UpdateWorkScheduleDto,
  ) {
    return await this.workScheduleService.updateWorkSchedule(
      workScheduleId,
      dto,
    );
  }

  @Delete(':id')
  @ForAdmin()
  @ResponseMessage('Successfully deleted work schedule')
  async deleteWorkSchedule(@Param('id') workScheduleId: string) {
    await this.workScheduleService.deleteWorkSchedule(workScheduleId);
  }

  @Post('assign')
  @ForAdmin()
  @UseInterceptors(NoFilesInterceptor())
  @ResponseMessage('Successfully assigned work schedule to user')
  async assignWorkScheduleToUser(@Body() dto: AssignWorkScheduleDto) {
    return await this.workScheduleService.assignWorkScheduleToUser(dto);
  }
}
