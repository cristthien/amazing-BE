import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsDateString,
  IsObject,
} from 'class-validator';

export class AuctionCreateDto {
  @IsString()
  @IsNotEmpty()
  name: string; // Tên sản phẩm, bắt buộc

  @IsObject()
  @IsOptional()
  description: string; // Dữ liệu mô tả dưới dạng JSON, optional

  @IsNumber()
  @IsNotEmpty()
  category_id: number; // ID của category, bắt buộc

  @IsString()
  @IsOptional() // Tình trạng, optional
  condition: string;

  @IsNumber()
  @IsNotEmpty()
  price: number; // Giá sản phẩm, bắt buộc

  @IsArray()
  images: string[];

  @IsDateString()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @IsNumber()
  @IsOptional() // Giá đấu giá khởi điểm, optional
  starting_bid: number;

  @IsObject()
  @IsOptional() // Thông số kỹ thuật, optional
  specifications: object;

  @IsNumber()
  userId: number;
}
