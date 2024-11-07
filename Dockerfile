# Sử dụng image Node.js
FROM node:16

# Thiết lập thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép file package.json và package-lock.json để cài đặt dependencies
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn của dự án vào container
COPY . .

# Build ứng dụng NestJS (tùy chọn, nếu bạn chỉ cần chạy trực tiếp, có thể bỏ qua dòng này)
RUN npm run build

# Mở cổng cho ứng dụng
EXPOSE 3000

# Lệnh chạy ứng dụng NestJS
CMD ["npm", "run", "start:dev"]
