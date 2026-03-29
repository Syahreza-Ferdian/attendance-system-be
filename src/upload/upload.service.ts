import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import path from 'path';
import * as fs from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  async compressAndSave(
    file: Express.Multer.File,
    destination: 'profiles' | 'attendances',
    subFolderForAttendance?: 'clockIn' | 'clockOut',
  ): Promise<string> {
    let finalDestination: string = destination;

    if (destination === 'attendances' && subFolderForAttendance) {
      finalDestination = `${destination}/${subFolderForAttendance}`;
    }

    const outputDir = path.join(process.cwd(), 'uploads', finalDestination);
    await fs.mkdir(outputDir, { recursive: true });

    const fileName = `${uuidv4()}.webp`;
    const outputPath = path.join(outputDir, fileName);

    try {
      await sharp(file.buffer)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);
    } catch {
      throw new InternalServerErrorException('Failed to process the image');
    }

    // console.log(`File saved to: ${outputPath}`);

    return `/uploads/${finalDestination}/${fileName}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);

    // console.log(`Attempting to delete file at: ${fullPath}`);

    try {
      await fs.unlink(fullPath);
    } catch {
      this.logger.warn(
        `Failed to delete file at ${fullPath}. It may not exist or is already deleted.`,
      );
    }
  }
}
