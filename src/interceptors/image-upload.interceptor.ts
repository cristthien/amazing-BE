import { Injectable } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import * as path from 'path'; // Import 'path' to resolve file paths
import * as fs from 'fs'; // Import 'fs' to create directories if needed

@Injectable()
export class ImageUploadInterceptor {
  static upload(fieldName: string) {
    return FileInterceptor(fieldName, {
      limits: {
        files: 1, // Chỉ cho phép tải lên 1 file
        fileSize: 10 * 1024 * 1024, // Giới hạn kích thước file (10MB)
      },
      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/gif',
          'image/webp',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif).'),
            false,
          );
        }
        callback(null, true); // Cho phép file ảnh hợp lệ
      },
      storage: diskStorage({
        // Use an absolute path for the destination
        destination: (req, file, callback) => {
          const uploadPath = path.resolve(__dirname, '../../public/images'); // Absolute path
          // Ensure the directory exists, otherwise create it
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const fileName = `${uuidv4()}${extname(file.originalname)}`; // Tạo tên file duy nhất
          callback(null, fileName); // Trả về tên file duy nhất
        },
      }),
    });
  }
}
