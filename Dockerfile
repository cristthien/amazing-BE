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

# Nếu bạn chỉ cần chạy trong môi trường phát triển, bỏ qua lệnh build
# Nếu bạn muốn build ứng dụng, giữ lại dòng này
RUN npm run build

# Mở cổng cho ứng dụng và WebSocket
EXPOSE 3000
EXPOSE 3002 

# Lệnh chạy ứng dụng (tùy chỉnh lệnh chạy theo môi trường)
CMD ["npm", "run", "start:dev"]

