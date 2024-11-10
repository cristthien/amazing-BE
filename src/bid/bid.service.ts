import { Injectable } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
// import { UpdateBidDto } from './dto/update-bid.dto';
import { Bid } from './entities/bid.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private bidsRepository: Repository<Bid>,
  ) {}
  async createBid(createBidDto: CreateBidDto): Promise<Bid> {
    const bid = this.bidsRepository.create(createBidDto);
    return this.bidsRepository.save(bid);
  }
  findAll() {
    return `This action returns all bid`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bid`;
  }

  // update(id: number, updateBidDto: UpdateBidDto) {
  //   return `This action updates a #${id} bid`;
  // }

  remove(id: number) {
    return `This action removes a #${id} bid`;
  }
}
