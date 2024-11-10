import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';

@Injectable()
export class ImagesUploadInterceptor {
  static upload() {
    return FilesInterceptor('images', 10, {
      // 'images' là field trong form-data, tối đa 10 file
      limits: {
        files: 10, // Giới hạn số lượng file tải lên là 10
        fileSize: 10 * 1024 * 1024, // Giới hạn kích thước mỗi file là 10MB
      },
      storage: diskStorage({
        destination: './public/images', // Thư mục lưu trữ hình ảnh
        filename: (req, file, callback) => {
          const fileExtension = extname(file.originalname);
          const fileName = `${uuidv4()}${fileExtension}`;
          callback(null, fileName); // Tạo tên file duy nhất
        },
      }),
    });
  }
}
