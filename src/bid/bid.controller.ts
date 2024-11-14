import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  Query,
} from '@nestjs/common';
import { BidService } from './bid.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { Roles } from '../common/decorator/roles.decorator';

@Controller('bid')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  @Roles('user')
  async createBid(@Body() createBidDto: CreateBidDto, @Request() req: any) {
    // Tạo một bid mới trong cơ sở dữ liệu
    const newBid = await this.bidService.createBid(createBidDto, req.user);
    return newBid;
  }

  @Get(':slug')
  findAll(
    @Param('slug') slug: string,
    @Query('page') page = 1, // Default to page 1
    @Query('limit') limit = 10,
  ) {
    // Default to 10 items per page) {
    return this.bidService.findAll(slug, +page, +limit);
  }
  @Get('/test/:slug')
  gehighestbid(@Param('slug') slug: string) {
    return this.bidService.getHighestBid(slug);
  }
}
