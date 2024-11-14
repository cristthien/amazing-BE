import { UserService } from '@/src/user/user.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
// import { UpdateBidDto } from './dto/update-bid.dto';
import { Bid } from './entities/bid.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UserPayload from '../common/dto/user-payload.dto';
import { AuctionsService } from '../auctions/auctions.service';
import { paginate } from '../common/helpers/pagination.util';

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private bidsRepository: Repository<Bid>,
    private auctionService: AuctionsService,
    private userService: UserService,
  ) {}
  // Create a new bid
  async createBid(createBidDto: CreateBidDto, user: UserPayload) {
    const { auctionSlug, amount } = createBidDto;

    // Validate user existence
    const userFromDB = await this.userService.findOne(user.id);
    if (!userFromDB) {
      throw new NotFoundException('User not found');
    }

    // Validate auction existence and get the highest bid details
    const auction = await this.auctionService.getHighestAuction(auctionSlug);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    const { user_id, highest_bid } = auction;
    if (userFromDB.id === user_id) {
      throw new BadRequestException(
        'You cannot bid on an auction you created.',
      );
    }

    if (amount <= highest_bid) {
      throw new BadRequestException(
        'The bid amount must be higher than the current highest bid.',
      );
    }

    // Create and save the bid
    const bid = this.bidsRepository.create({
      amount,
      user: userFromDB,
      auctionSlug,
    });

    try {
      await this.auctionService.updateHighestBid(auctionSlug, amount);
      const savedBid = await this.bidsRepository.save(bid);

      return {
        ...savedBid,
        user: {
          id: userFromDB.id,
          username: userFromDB.username,
          email: userFromDB.email,
        } as any,
      };
    } catch (error) {
      console.error('Error saving bid:', error);
      throw new Error('Failed to save bid to the database.');
    }
  }

  // Find all bids for a specific auction based on the slug
  async findAll(slug: string, page: number, limit: number) {
    // Find the auction by slug
    const auction = await this.auctionService.findOnlyAuction(slug);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    // Use a query builder for pagination
    const queryBuilder = this.bidsRepository
      .createQueryBuilder('bid')
      .leftJoinAndSelect('bid.user', 'user')
      .where('bid.auctionSlug = :slug', { slug });

    // Paginate using the utility function
    const paginatedResult = await paginate<Bid>(page, limit, queryBuilder);

    // Map the paginated data to only include required fields for the user
    paginatedResult.data = paginatedResult.data.map((bid) => ({
      ...bid,
      user: {
        id: bid.user.id,
        username: bid.user.username,
        email: bid.user.email,
      },
    })) as any;

    return paginatedResult;
  }
  async getHighestBid(slug: string) {
    // Get the highest bid for the auction and include the User entity in the result
    const highestBid = await this.bidsRepository
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
}
