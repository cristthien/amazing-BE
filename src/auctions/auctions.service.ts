import { AuctionCreateDto } from './dto/create-auction.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from './entities/auction.entity';
import { Category } from '../categories/entities/category.entity';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { paginate } from '../common/helpers/pagination.util';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>, // Inject Category repository
  ) {}

  async createAuction(createAuctionDto: AuctionCreateDto): Promise<Auction> {
    // Sử dụng findOne với options để tìm category bằng category_id
    const category = await this.categoryRepository.findOne({
      where: { id: createAuctionDto.category_id }, // Sử dụng where để tìm category theo id
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Tạo đối tượng Auction mới từ DTO
    const auction = this.auctionRepository.create({
      name: createAuctionDto.name,
      description: createAuctionDto.description,
      category: category, // Gán category vào auction
      condition: createAuctionDto.condition,
      price: createAuctionDto.price,
      images: createAuctionDto.images, // Lưu ảnh vào danh sách
      start_date: createAuctionDto.start_date
        ? new Date(createAuctionDto.start_date)
        : new Date(),
      end_date: createAuctionDto.end_date
        ? new Date(createAuctionDto.end_date)
        : new Date(),
      starting_bid: createAuctionDto.starting_bid,
      specifications: createAuctionDto.specifications,
    });

    // Lưu vào cơ sở dữ liệu
    return this.auctionRepository.save(auction);
  }

  async getAuctionsByCategory(
    categoryId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Auction>> {
    // Create a query builder to filter by category and paginate the results
    const queryBuilder = this.auctionRepository
      .createQueryBuilder('auction')
      .where('auction.category_id = :categoryId', { categoryId });

    // Use the paginate utility function to apply pagination
    return paginate<Auction>(page, limit, queryBuilder);
  }
  findAll() {
    return `This action returns all auctions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auction`;
  }

  // update(id: number, updateAuctionDto: UpdateAuctionDto) {
  //   return `This action updates a #${id} auction`;
  // }

  remove(id: number) {
    return `This action removes a #${id} auction`;
  }
}
