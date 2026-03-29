import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import path from 'path';
import * as fs from 'fs';

@Controller({
  path: 'uploads',
})
export class UploadController {
  @Get('profiles/:filename')
  getProfileImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'uploads', 'profiles', filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    return res.sendFile(filePath);
  }

  @Get('attendances/:subFolder/:filename')
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
