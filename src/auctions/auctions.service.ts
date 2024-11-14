import { InvoiceService } from './../invoice/invoice.service';
import { AuctionCreateDto } from './dto/create-auction.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from './entities/auction.entity';
import { Category } from '../categories/entities/category.entity';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { paginate } from '../common/helpers/pagination.util';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { User } from '../user/entities/user.entity';
import deleteImages from '../common/helpers/delete-image.util';
import UserPayload from '../common/dto/user-payload.dto';
import { AuctionStatus, UserRole } from '../common/enums';
import { Bid } from '../bid/entities/bid.entity';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>, // Inject Category repository
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // Inject Category repository
    private readonly invoiceService: InvoiceService,
  ) {}

  async createAuction(createAuctionDto: AuctionCreateDto): Promise<Auction> {
    // Generate the base slug from the name
    const baseSlug = slugify(createAuctionDto.name, { lower: true });

    let uniqueSlug = '';
    let existingAuction = null;

    // Loop until a unique slug is found
    do {
      // Generate a UUID and take the first 5 characters
      const shortUuid = uuidv4().split('-')[0].slice(0, 5); // Taking the first 5 characters of UUID

      // Combine the slug with the short UUID
      uniqueSlug = `${baseSlug}-${shortUuid}`;

      // Check if the slug already exists in the database
      existingAuction = await this.auctionRepository.findOne({
        where: { slug: uniqueSlug },
      });
    } while (existingAuction); // If the auction with this slug exists, regenerate the slug

    // Ensure starting_bid is set to 0 if it's null or undefined
    const startingBid = Number(createAuctionDto.starting_bid) ?? 0;

    // Create the auction object
    const category = await this.categoryRepository.findOne({
      where: { id: createAuctionDto.category_id },
    });

    // Find the user by ID (assuming createAuctionDto.userId contains the user's ID)
    const user = await this.userRepository.findOne({
      where: { id: createAuctionDto.userId }, // Fetch user by ID
    });

    if (!category) {
      throw new Error('Category not found');
    }
    if (startingBid <= 0) {
      throw new Error('Starting for Bid must be  positive');
    }

    if (!user) {
      throw new Error('User not found');
    }

    // Validate start_date and end_date
    const startDate = createAuctionDto.start_date
      ? new Date(createAuctionDto.start_date)
      : new Date();
    const endDate = createAuctionDto.end_date
      ? new Date(createAuctionDto.end_date)
      : new Date();
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }
    if (endDate <= new Date()) {
      throw new Error('End date must be in the future');
    }
    // Set initial status based on date conditions
    const status =
      new Date() >= startDate && new Date() < endDate
        ? AuctionStatus.ACTIVE
        : AuctionStatus.PENDING;

    const auction = this.auctionRepository.create({
      name: createAuctionDto.name,
      description: createAuctionDto.description,
      category: category,
      condition: createAuctionDto.condition,
      price: createAuctionDto.price,
      highest_bid: startingBid,
      images: createAuctionDto.images,
      start_date: startDate,
      end_date: endDate,
      starting_bid: startingBid, // Set starting_bid to 0 if it's null or undefined
      specifications: createAuctionDto.specifications,
      slug: uniqueSlug, // Use the unique slug
      user: user,
      status,
    });

    // Save the auction and return it
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
  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Auction>> {
    const queryBuilder = this.auctionRepository.createQueryBuilder('auction');

    // Join the category and user relations
    queryBuilder
      .leftJoinAndSelect('auction.category', 'category') // Join category
      .leftJoinAndSelect('auction.user', 'user'); // Join user

    return paginate<Auction>(page, limit, queryBuilder);
  }

  async findOne(slug: string): Promise<Auction> {
    // Use 'slug' to find the auction and join 'category' and 'user' relations
    const auction = await this.auctionRepository
      .createQueryBuilder('auction')
      .leftJoinAndSelect('auction.category', 'category') // Join category
      .leftJoinAndSelect('auction.user', 'user') // Join user
      .where('auction.slug = :slug', { slug }) // Filter by slug
      .getOne(); // Get the single auction

    // Check if the auction exists, otherwise throw a NotFoundException
    if (!auction) {
      throw new NotFoundException(`Auction with slug '${slug}' not found`);
    }
    delete auction.category.thumbnail;
    const { id, username, email } = auction.user; // Destructure only these fields
    auction.user = { id, username, email } as any;
    // Return the found auction
    return auction;
  }
  async findOnlyAuction(slug: string) {
    const auction = await this.auctionRepository.findOne({
      where: { slug: slug },
    });
    if (!auction) {
      throw new Error('Auction not found');
    }
    return auction;
  }

  // Hàm cập nhật phiên đấu giá
  async updateBySlug(
    slug: string,
    updateAuctionDto: UpdateAuctionDto,
    user: UserPayload,
  ): Promise<Auction> {
    // Tìm phiên đấu giá theo slug
    const auction = await this.auctionRepository
      .createQueryBuilder('auction')
      .leftJoinAndSelect('auction.user', 'user')
      .select(['auction', 'user.id', 'user.role']) // Only select auction data and user.id
      .where('auction.slug = :slug', { slug })
      .getOne();

    if (!auction) {
      throw new NotFoundException(`Auction with slug ${slug} not found`);
    }
    if (auction.user.id != user.id && user.role != UserRole.Admin) {
      throw new UnauthorizedException(
        `You do not have permission to update this auction`,
      );
    }
    if (updateAuctionDto.highest_bid <= 0) {
      throw new BadRequestException(
        `New bid must be higher than the current highest bid of ${auction.highest_bid}`,
      );
    }

    if (updateAuctionDto.images) {
      deleteImages(auction.images); // Call the helper function to delete old images
      auction.images = updateAuctionDto.images; // Update auction images with the new ones
    }

    // Nếu trường name thay đổi, cập nhật slug tương ứng
    if (updateAuctionDto.name && updateAuctionDto.name !== auction.name) {
      const baseSlug = slugify(updateAuctionDto.name, { lower: true });
      const shortUuid = uuidv4().split('-')[0].slice(0, 5); // Tạo UUID ngắn
      auction.slug = `${baseSlug}-${shortUuid}`;
    }

    // Cập nhật các trường dữ liệu còn lại từ DTO
    Object.assign(auction, updateAuctionDto);

    // Lưu lại và trả về phiên đấu giá đã cập nhật
    return this.auctionRepository.save(auction);
  }
  async updateHighestBid(slug: string, highest_bid: number): Promise<Auction> {
    // Find the auction by slug
    const auction = await this.auctionRepository.findOne({ where: { slug } });

    if (!auction) {
      throw new NotFoundException(`Auction with slug ${slug} not found`);
    }
    if (auction.highest_bid && highest_bid <= auction.highest_bid) {
      throw new BadRequestException(
        `New bid must be higher than the current highest bid of ${auction.highest_bid}`,
      );
    }
    auction.highest_bid = highest_bid;

    // Save the updated auction and return it
    return this.auctionRepository.save(auction);
  }
  async getHighestAuction(slug: string) {
    const auction = await this.auctionRepository
      .createQueryBuilder('auction')
      .leftJoinAndSelect('auction.user', 'user') // Assuming `auction` has a relation named `user`
      .select(['auction.highest_bid', 'user.id'])
      .where('auction.slug = :slug', { slug })
      .getOne();

    if (!auction) {
      throw new NotFoundException(`Auction with slug '${slug}' not found`);
    }

    // Return the highest bid along with user id
    return {
      highest_bid: auction.highest_bid,
      user_id: auction.user ? auction.user.id : null, // Check if user exists
    };
  }
  remove(id: number) {
    return `This action removes a #${id} auction`;
  }
  async getHighestBid(slug: string) {
    // Get the highest bid for the auction and include the User entity in the result
    const highestBid = await this.bidRepository
      .createQueryBuilder('bid')
      .leftJoinAndSelect('bid.user', 'user') // Join with the user entity
      .where('bid.auctionSlug = :slug', { slug })
      .orderBy('bid.amount', 'DESC')
      .getOne();

    // Return only the amount and userId if a bid exists, otherwise null
    return highestBid
      ? { amount: highestBid.amount, userId: highestBid.user.id }
      : null;
  }
  async getNearestEndDate() {
    try {
      // Truy vấn auction có end_date gần nhất với status là 'active'
      const nearestAuction = await this.auctionRepository
        .createQueryBuilder('auction')
        .where('auction.status = :status', { status: AuctionStatus.ACTIVE })
        .orderBy('auction.end_date', 'ASC')
        .limit(1) // Giới hạn trả về 1 bản ghi duy nhất
        .getOne(); // Trả về duy nhất 1 auction

      if (!nearestAuction) {
        return { end_date: null };
      }
      return {
        target_time: nearestAuction.end_date,
      };
    } catch (error) {
      console.error('Error fetching auctions:', error);
      throw new Error('Could not fetch auctions');
    }
  }
  async updateStatusByEndDate(endDate: Date) {
    try {
      // Fetch auctions to update
      const auctionsToUpdate = await this.auctionRepository.find({
        where: { end_date: endDate, status: AuctionStatus.ACTIVE },
      });

      if (auctionsToUpdate.length === 0) {
        console.log('No active auctions found with the specified end date.');
        return []; // Return an empty list if no auctions found
      }

      // Update the status of each auction and create invoices for the highest bid
      const updatedAuctions = await Promise.all(
        auctionsToUpdate.map(async (auction) => {
          auction.status = AuctionStatus.CLOSED;

          // Get the highest bid for this auction
          const highestBid = await this.getHighestBid(auction.slug);

          // If a highest bid is found, create an invoice
          if (highestBid) {
            await this.invoiceService.create(`${highestBid.userId}`, auction);
          }

          return auction;
        }),
      );

      // Save the updated auctions
      await this.auctionRepository.save(updatedAuctions);

      console.log(`${updatedAuctions.length} auctions were updated.`);
    } catch (error) {
      console.error('Error updating auctions:', error);
      throw new Error('Could not update auctions');
    }
  }

  async getNearestStartDate() {
    try {
      // Truy vấn auction có end_date gần nhất với status là 'active'
      const nearestAuction = await this.auctionRepository
        .createQueryBuilder('auction')
        .where('auction.status = :status', { status: AuctionStatus.PENDING })
        .orderBy('auction.start_date', 'ASC')
        .limit(1) // Giới hạn trả về 1 bản ghi duy nhất
        .getOne(); // Trả về duy nhất 1 auction

      if (!nearestAuction) {
        return { start_date: null };
      }
      return {
        target_time: nearestAuction.start_date,
      };
    } catch (error) {
      console.error('Error fetching auctions:', error);
      throw new Error('Could not fetch auctions');
    }
  }
  async updateStatusByStartDate(startDate: Date) {
    try {
      // Cập nhật trạng thái cho tất cả các auction có end_date trùng với giá trị nhập vào
      const updateResult = await this.auctionRepository
        .createQueryBuilder()
        .update(Auction)
        .set({ status: AuctionStatus.ACTIVE }) // Cập nhật status thành 'closed'
        .where('start_date = :startDate', { startDate })
        .execute();

      if (updateResult.affected === 0) {
        console.log('No auctions found with the specified start date.');
      } else {
        console.log(`${updateResult.affected} auctions were updated.`);
      }
    } catch (error) {
      console.error('Error updating auctions:', error);
      throw new Error('Could not update auctions');
    }
  }
}
