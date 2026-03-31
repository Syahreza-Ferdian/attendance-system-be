import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import path from 'path';
import * as fs from 'fs';
import { Public } from 'src/authentication/authentication.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller({
  path: 'uploads',
  version: '1',
})
@ApiTags('Uploads')
export class UploadController {
  @Get('profiles/:filename')
  @Public()
  @ApiOperation({
    summary:
      'Get user profile image by specifying image file path that been stored in the local storage',
  })
  @ApiResponse({
    status: 200,
    description: 'The user profile image has been successfully retrieved.',
  })
  getProfileImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'uploads', 'profiles', filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    return res.sendFile(filePath);
  }

  @Get('attendances/:subFolder/:filename')
  @Public()
  @ApiOperation({
    summary: 'Get attendance proof by specifying subfolder and filename',
  })
  @ApiResponse({
    status: 200,
    description: 'The attendance proof has been successfully retrieved.',
  })
  getAttendanceProof(
    @Param('subFolder') subFolder: 'clockIn' | 'clockOut',
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const allowedSubFolders = ['clockIn', 'clockOut'];

    if (!allowedSubFolders.includes(subFolder)) {
      throw new NotFoundException('Invalid subfolder');
    }

    const filePath = path.join(
      process.cwd(),
      'uploads',
      'attendances',
      subFolder,
      filename,
    );

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    return res.sendFile(filePath);
  }
}
