import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { BidService } from './bid.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { Roles } from '../common/decorator/roles.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorator/customize';

@ApiTags('5 - Bids')
@Controller('bids')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  @Roles('user')
  @ApiOperation({
    summary: 'Create a new bid',
    description:
      'Allows a user to place a new bid on an auction. The bid information and user details are provided in the request body.',
  })
  async createBid(@Body() createBidDto: CreateBidDto, @Request() req: any) {
    // Tạo một bid mới trong cơ sở dữ liệu
    const newBid = await this.bidService.createBid(createBidDto, req.user);
    return newBid;
  }

  @Get(':slug')
  @Public()
  @ApiOperation({
    summary: 'Get all bids for an auction',
    description:
      'Retrieve all bids associated with a specific auction identified by its slug. This endpoint is publicly accessible.',
  })
  findAll(@Param('slug') slug: string) {
    return this.bidService.findAll(slug);
  }
}
