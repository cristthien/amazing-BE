import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import * as path from 'path'; // Make sure path is imported

@Injectable()
export class ImagesUploadInterceptor {
  static upload() {
    return FilesInterceptor('images', 10, {
      limits: {
        files: 10, // Giới hạn số lượng file tải lên là 10
        fileSize: 10 * 1024 * 1024, // Giới hạn kích thước mỗi file là 10MB
      },
      storage: diskStorage({
        destination: path.join(__dirname, '../../public/images'), // Correct usage of path.join()
        filename: (req, file, callback) => {
          const fileExtension = extname(file.originalname);
          const fileName = `${uuidv4()}${fileExtension}`;
          callback(null, fileName); // Tạo tên file duy nhất
        },
      }),
    });
  }
}
