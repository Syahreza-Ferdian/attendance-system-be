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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Work Schedules')
@Controller({
  path: 'work-schedules',
  version: '1',
})
export class WorkScheduleController {
  constructor(private workScheduleService: WorkScheduleService) {}

  @Get()
  @ForAdmin()
  @ResponseMessage('Successfully retrieved all work schedules')
  @ApiOperation({
    summary: 'Get all work schedules with pagination and optional search',
  })
  @ApiResponse({
    status: 200,
    description: 'List of work schedules',
  })
  async getAllWorkSchedules(@Query() query: WorkScheduleQuery) {
    return await this.workScheduleService.getAllWorkSchedules(query);
  }

  @Get(':id')
  @ForAdmin()
  @ResponseMessage('Successfully retrieved work schedule information')
  @ApiOperation({
    summary: 'Get work schedule information by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Work schedule information',
  })
  async getWorkScheduleById(@Param('id') workScheduleId: string) {
    return await this.workScheduleService.getWorkScheduleById(workScheduleId);
  }

  @Post()
  @ForAdmin()
  @ResponseMessage('Successfully created work schedule')
  @UseInterceptors(NoFilesInterceptor())
  @ApiOperation({
    summary: 'Create a new work schedule',
  })
  @ApiResponse({
    status: 201,
    description: 'The work schedule has been successfully created.',
  })
  async createWorkSchedule(@Body() dto: CreateWorkScheduleDto) {
    return await this.workScheduleService.createWorkSchedule(dto);
  }

  @Patch(':id')
  @ForAdmin()
  @UseInterceptors(NoFilesInterceptor())
  @ResponseMessage('Successfully updated work schedule')
  @ApiOperation({
    summary: 'Update an existing work schedule',
  })
  @ApiResponse({
    status: 200,
    description: 'The work schedule has been successfully updated.',
  })
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
  @ApiOperation({
    summary: 'Delete a work schedule by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'The work schedule has been successfully deleted.',
  })
  async deleteWorkSchedule(@Param('id') workScheduleId: string) {
    await this.workScheduleService.deleteWorkSchedule(workScheduleId);
  }

  @Post('assign')
  @ForAdmin()
  @UseInterceptors(NoFilesInterceptor())
  @ApiOperation({
    summary: 'Assign a work schedule to a user',
  })
  @ApiResponse({
    status: 200,
    description:
      'The work schedule has been successfully assigned to the user.',
  })
  @ResponseMessage('Successfully assigned work schedule to user')
  async assignWorkScheduleToUser(@Body() dto: AssignWorkScheduleDto) {
    return await this.workScheduleService.assignWorkScheduleToUser(dto);
  }
}
