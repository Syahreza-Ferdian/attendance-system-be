import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ResponseMessage } from 'src/common/response/response.decorator';
import { ForAdmin } from 'src/authorization/authorization.decorator';
import { CurrentUser } from './users.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadConfig } from 'src/upload/upload.config';
import { UserQuery } from './dto/query-user.dto';
import { AttendanceService } from 'src/attendance/attendance.service';

@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ResponseMessage('Successfully retrieved user information')
  async getCurrentUser(@CurrentUser() user: { sub: string }) {
    return await this.usersService.findUserDynamic(
      {
        userId: user.sub,
      },
      false,
      ['withRole', 'withPosition', 'withDivision'],
    );
  }

  @Get('all')
  @ForAdmin()
  @ResponseMessage('Successfully retrieved all users')
  async getAllUsers(@Query() query: UserQuery) {
    return await this.usersService.getAllUsers(query);
  }

  @Get(':id')
  @ForAdmin()
  @ResponseMessage('Successfully retrieved user information')
  async getUserById(@Param('id') id: string) {
    return await this.usersService.getUserById(id);
  }

  @Post()
  @ForAdmin()
  @UseInterceptors(FileInterceptor('profilePictureFile', imageUploadConfig))
  @ResponseMessage('Successfully created user')
  async createUser(
    @Body() userData: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.usersService.createUser(userData, file);
  }

  @Patch(':id')
  @ForAdmin()
  @UseInterceptors(FileInterceptor('profilePictureFile', imageUploadConfig))
  @ResponseMessage('Successfully updated user')
  async updateUser(
    @Param('id') id: string,
    @Body() userData: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.usersService.updateUser(id, userData, file);
  }

  @Delete(':id')
  @ForAdmin()
  @ResponseMessage('Successfully deleted user')
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }

  @Delete(':id/profile-picture')
  @ForAdmin()
  @ResponseMessage('Successfully deleted user profile picture')
  async deleteProfilePicture(@Param('id') id: string) {
    return await this.usersService.deleteProfilePicture(id);
  }
}
