import {
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
  IsArray,
} from 'class-validator';

export class UpdateAuctionDto {
  @IsOptional()
  @IsString()
  name?: string; // Tên của đấu giá

  @IsOptional()
  @IsString()
  description?: string; // Mô tả của đấu giá

  @IsOptional()
  @IsString()
  slug?: string; // Slug của đấu giá, có thể được thay đổi

  @IsOptional()
  @IsNumber()
  category_id?: number; // Id của Category, có thể được thay đổi

  @IsOptional()
  @IsString()
  brand?: string; // Thương hiệu của sản phẩm

  @IsOptional()
  @IsString()
  model?: string; // Mẫu của sản phẩm

  @IsOptional()
  @IsString()
  condition?: string; // Điều kiện của sản phẩm

  @IsOptional()
  @IsNumber()
  price?: number; // Giá của sản phẩm

  @IsOptional()
  @IsDate()
  start_date?: Date; // Ngày bắt đầu đấu giá

  @IsOptional()
  @IsDate()
  end_date?: Date; // Ngày kết thúc đấu giá

  @IsOptional()
  @IsNumber()
  starting_bid?: number; // Giá khởi điểm của đấu giá

  @IsOptional()
  @IsNumber()
  highest_bid?: number; // Giá đấu giá cao nhất

  @IsOptional()
  @IsNumber()
  bid_count?: number; // Số lượt đấu giá

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]; // Danh sách hình ảnh của đấu giá

  @IsOptional()
  @IsString()
  specifications?: any; // Thông số kỹ thuật của sản phẩm
}
