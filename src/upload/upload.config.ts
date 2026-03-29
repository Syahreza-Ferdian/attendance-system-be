import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

export const imageUploadConfig: MulterOptions = {
  storage: memoryStorage(),
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
      callback(
        new BadRequestException('Only JPEG, PNG, and WEBP images are allowed'),
        false,
      );
      return;
    }
    callback(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};
