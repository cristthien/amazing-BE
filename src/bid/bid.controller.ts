import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { BidService } from './bid.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { Public } from '../common/decorator/customize';

@Controller('bid')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  @Public()
  async createBid(@Body() createBidDto: CreateBidDto) {
    // Tạo một bid mới trong cơ sở dữ liệu
    const newBid = await this.bidService.createBid(createBidDto);
    return newBid;
  }

  @Get()
  findAll() {
    return this.bidService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bidService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBidDto: UpdateBidDto) {
  //   return this.bidService.update(+id, updateBidDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bidService.remove(+id);
  }
}
