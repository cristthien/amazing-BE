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
  BadRequestException,
} from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionCreateDto } from './dto/create-auction.dto';
// import { UpdateAuctionDto } from './dto/update-auction.dto';
import { ImagesUploadInterceptor } from '../interceptors/images-upload.interceptor';
import { Roles } from '../common/decorator/roles.decorator';
import { Public } from '../common/decorator/customize';
import { Auction } from './entities/auction.entity';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { UserRole } from '../common/enums';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('4 - Auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Post()
  @Roles('user')
  @ApiOperation({
    summary: 'Create a new auction',
    description:
      'Allows a user to create a new auction. Images can be uploaded and will be added to the auction record.',
  })
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
  @Get('search')
  @Public()
  @ApiOperation({
    summary: 'Search auctions',
    description: 'Search auctions by a keyword provided as a query parameter.',
  })
  async searchProducts(@Query('key') key: string): Promise<any> {
    if (!key || key.trim() === '') {
      return {
        statusCode: 400,
        message: 'Search key is required',
      };
    }

    return this.auctionsService.searchAuctions(key);
  }

  @Get('user/:id')
  @Roles('user')
  @ApiOperation({
    summary: 'Get auctions by user ID',
    description:
      'Retrieve all auctions created by a specific user. Users can only retrieve their own auctions unless they are an admin.',
  })
  async getAuctionsByUserID(
    @Param('id') id: string,
    @Request() req: any,
    @Query('page') page = 1, // Default to page 1
    @Query('limit') limit = 10, // Default to 10 items per page
  ) {
    const { user } = req;
    if (id == '-1') {
      id = user.id;
    }
    // Permission check: Only allow the user to fetch their own auctions or if they are an Admin
    if (id != `${user.id}` && user.role !== UserRole.Admin) {
      throw new BadRequestException(
        'You do not have permission to access this resource',
      );
    }

    // Fetch the auctions by the user ID with pagination
    return this.auctionsService.getAllAuctionsByUserID(id, user, +page, +limit);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all auctions',
    description:
      'Retrieve a paginated list of all auctions available on the platform.',
  })
  async getAllAuctions(
    @Query('page') page = 1, // Default to page 1
    @Query('limit') limit = 10, // Default to 10 items per page
  ) {
    return this.auctionsService.findAll(+page, +limit);
  }
  @Get('new-listing')
  @Public()
  @ApiOperation({
    summary: 'Get new listings',
    description: 'Retrieve the newest auctions created on the platform.',
  })
  async newlisting() {
    return this.auctionsService.getNewListing();
  }
  @Get('explore')
  @Public()
  @ApiOperation({
    summary: 'Explore auctions',
    description:
      'Retrieve a list of featured or popular auctions for users to explore.',
  })
  async explore() {
    return this.auctionsService.explore();
  }
  @Get(':slug')
  @Public()
  @ApiOperation({
    summary: 'Get auction details',
    description:
      'Retrieve detailed information about a specific auction by slug.',
  })
  findOne(@Param('slug') slug: string) {
    return this.auctionsService.findOne(slug);
  }

  @Patch(':slug')
  @Roles('user')
  @ApiOperation({
    summary: 'Update an auction',
    description:
      'Update the details of an auction. Only the creator of the auction can update it. Images can be uploaded and updated as well.',
  })
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
  @ApiOperation({
    summary: 'Delete an auction',
    description:
      'Delete an auction by its ID. This operation is restricted to admins.',
  })
  remove(@Param('id') id: string) {
    return this.auctionsService.remove(+id);
  }
}
