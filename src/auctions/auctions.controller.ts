import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionCreateDto } from './dto/create-auction.dto';
// import { UpdateAuctionDto } from './dto/update-auction.dto';
import { Public } from '../common/decorator/customize';
import { ImagesUploadInterceptor } from '../interceptors/images-upload.interceptor';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Post()
  @Public()
  @UseInterceptors(ImagesUploadInterceptor.upload()) // Sử dụng interceptor cho việc upload ảnh
  async create(
    @Body() createAuctionDto: AuctionCreateDto, // Lấy thông tin auction từ body
    @UploadedFiles() images: Express.Multer.File[], // Lấy tất cả các file ảnh đã upload
  ): Promise<any> {
    // Kiểm tra nếu có ảnh, thêm tên file vào mảng images của DTO
    if (images && images.length > 0) {
      createAuctionDto.images = images.map(
        (file) => `public/images/${file.filename}`,
      ); // Thêm tiền tố vào tên file
    }
    // Gọi service để tạo auction mới và lưu vào cơ sở dữ liệu
    return this.auctionsService.createAuction(createAuctionDto);
  }
  @Get()
  findAll() {
    return this.auctionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auctionsService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuctionDto: UpdateAuctionDto) {
  //   return this.auctionsService.update(+id, updateAuctionDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auctionsService.remove(+id);
  }
}
