import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
  Patch,
  Request,
} from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionCreateDto } from './dto/create-auction.dto';
// import { UpdateAuctionDto } from './dto/update-auction.dto';
import { ImagesUploadInterceptor } from '../interceptors/images-upload.interceptor';
import { Roles } from '../common/decorator/roles.decorator';
import { Public } from '../common/decorator/customize';
import { Auction } from './entities/auction.entity';
import { UpdateAuctionDto } from './dto/update-auction.dto';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Post()
  @Roles('user')
  @UseInterceptors(ImagesUploadInterceptor.upload()) // Sử dụng interceptor cho việc upload ảnh
  async create(
    @Request() req: any,
    @Body() createAuctionDto: AuctionCreateDto, // Lấy thông tin auction từ body
    @UploadedFiles() images: Express.Multer.File[], // Lấy tất cả các file ảnh đã upload
  ): Promise<any> {
    createAuctionDto.userId = +req.user.id;
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
  @Public()
  async getAllAuctions(
    @Query('page') page = 1, // Default to page 1
    @Query('limit') limit = 10, // Default to 10 items per page
  ) {
    return this.auctionsService.findAll(page, limit);
  }

  @Get(':slug')
  @Public()
  findOne(@Param('slug') slug: string) {
    return this.auctionsService.findOne(slug);
  }

  @Patch(':slug')
  @Roles('user')
  @UseInterceptors(ImagesUploadInterceptor.upload()) // Sử dụng interceptor cho việc upload ảnh
  async update(
    @Param('slug') slug: string, // Sử dụng slug thay vì id
    @Body() updateAuctionDto: UpdateAuctionDto,
    @UploadedFiles() images: Express.Multer.File[], // Lấy tất cả các file ảnh đã upload
    @Request() req: any,
  ): Promise<Auction> {
    if (images && images.length > 0) {
      updateAuctionDto.images = images.map(
        (file) => `public/images/${file.filename}`,
      ); // Thêm tiền tố vào tên file
    }
    return this.auctionsService.updateBySlug(slug, updateAuctionDto, req.user);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.auctionsService.remove(+id);
  }
}
