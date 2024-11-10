import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1; // Mặc định là trang 1 nếu không có giá trị

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10; // Mặc định là 10 bản ghi mỗi trang
}
