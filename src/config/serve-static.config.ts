// src/config/serve-static.config.ts
import { join } from 'path';

export const serveStaticConfig = {
  rootPath: join(__dirname, '..', '..', 'public'), // Thư mục public nằm ở cùng cấp với src
  serveRoot: '/public', // URL root để truy cập các file
};
