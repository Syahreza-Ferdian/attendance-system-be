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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller({
  path: 'users',
  version: '1',
})
@ApiBearerAuth()
@ApiTags('Users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ResponseMessage('Successfully retrieved user information')
  @ApiOperation({
    summary: 'Get current user information',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user information',
  })
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
  @ApiOperation({
    summary: 'Get all users with pagination and optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users',
  })
  async getAllUsers(@Query() query: UserQuery) {
    return await this.usersService.getAllUsers(query);
  }

  @Get(':id')
  @ForAdmin()
  @ResponseMessage('Successfully retrieved user information')
  @ApiOperation({
    summary: 'Get user information by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'User information',
  })
  async getUserById(@Param('id') id: string) {
    return await this.usersService.getUserById(id);
  }

  @Post()
  @ForAdmin()
  @UseInterceptors(FileInterceptor('profilePictureFile', imageUploadConfig))
  @ResponseMessage('Successfully created user')
  @ApiOperation({
    summary: 'Create a new user',
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
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
  @ApiOperation({
    summary: 'Update user information',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
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
  @ApiOperation({
    summary: 'Delete a user',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }

  @Delete(':id/profile-picture')
  @ForAdmin()
  @ResponseMessage('Successfully deleted user profile picture')
  @ApiOperation({
    summary: 'Delete user profile picture',
  })
  @ApiResponse({
    status: 200,
    description: 'The user profile picture has been successfully deleted.',
  })
  async deleteProfilePicture(@Param('id') id: string) {
    return await this.usersService.deleteProfilePicture(id);
  }
}
