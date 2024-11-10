import { Injectable } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class ImageUploadInterceptor {
  // Thêm tham số `fieldName` vào để có thể truyền tên trường
  static upload(fieldName: string) {
    return FileInterceptor(fieldName, {
      // Giới hạn chỉ tải lên 1 file
      limits: {
        files: 1, // Chỉ cho phép tải lên 1 file
        fileSize: 10 * 1024 * 1024, // Giới hạn kích thước file (ví dụ: 10MB)
      },
      // Lọc các file ảnh
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
        destination: './public/images', // Thư mục lưu trữ hình ảnh
        filename: (req, file, callback) => {
          const fileName = `${uuidv4()}${extname(file.originalname)}`; // Tạo tên file duy nhất
          callback(null, fileName); // Trả về tên file duy nhất
        },
      }),
    });
  }
}
