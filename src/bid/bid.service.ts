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
import { AuctionStatus } from '../common/enums';

@Injectable()
export class BidService {
  private isLocked: boolean = false; // Biến khóa
  constructor(
    @InjectRepository(Bid)
    private bidsRepository: Repository<Bid>,
    private auctionService: AuctionsService,
    private userService: UserService,
  ) {}
  // Create a new bid
  async createBid(createBidDto: CreateBidDto, user: UserPayload) {
    if (this.isLocked) {
      throw new Error(
        'Another bid is being processed. Please try again later.',
      );
    }
    this.isLocked = true; // Khóa lại trước khi xử lý
    try {
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

      const { user_id, highest_bid, status } = auction;
      if (status == AuctionStatus.CLOSED) {
        throw new BadRequestException('Auction is closed');
      }
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

      await this.auctionService.updateHighestBid(auctionSlug, amount);
      const savedBid = await this.bidsRepository.save(bid);

      return {
        amount,
        ...savedBid,
        user: {
          id: userFromDB.id,
          username: userFromDB.username,
          email: userFromDB.email,
        } as any,
      };
    } catch (error) {
      throw new Error(error.message);
    } finally {
      this.isLocked = false; // Mở khóa sau khi xử lý
    }
  }
  async createBidWebsocket(createBidDto: CreateBidDto, userid: number) {
    if (this.isLocked) {
      throw new Error(
        'Another bid is being processed. Please try again later.',
      );
    }
    this.isLocked = true; // Khóa lại trước khi xử lý
    try {
      const { auctionSlug, amount } = createBidDto;

      // Validate user existence
      const userFromDB = await this.userService.findOne(userid);
      if (!userFromDB) {
        throw new NotFoundException('User not found');
      }

      // Validate auction existence and get the highest bid details
      const auction = await this.auctionService.getHighestAuction(auctionSlug);
      if (!auction) {
        throw new NotFoundException('Auction not found');
      }

      const { user_id, highest_bid, status } = auction;
      if (status == AuctionStatus.CLOSED) {
        throw new BadRequestException('Auction is closed');
      }
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
    } finally {
      this.isLocked = false; // Mở khóa sau khi xử lý
    }
  }
  // Find all bids for a specific auction based on the slug
  async findAll(slug: string) {
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

    // Specify the fields to select (only id, username, and email)
    queryBuilder.addSelect(['user.id', 'user.username', 'user.email']);

    // Paginate using the utility function
    const results = await queryBuilder.getMany();

    // Map the paginated data to only include required fields for the user
    const mappedResults = results.map((bid) => ({
      ...bid,
      user: {
        id: bid.user.id,
        username: bid.user.username,
        email: bid.user.email,
      },
    }));

    return mappedResults;
  }

  async getBidsByAuctionSlug(slug: string) {
    const auction = await this.auctionService.findOnlyAuction(slug);
    if (!auction) return null;

    // Nếu chưa có bid nào, trả về giá khởi điểm
    if (auction.highest_bid == auction.starting_bid) {
      return {
        highest_bid: auction.highest_bid,
        numOfBid: 0, // Chưa có ai bid
        bids: [], // Danh sách trống
      };
    }

    // Lấy danh sách tất cả các bids
    const bids = await this.bidsRepository
      .createQueryBuilder('bid')
      .leftJoinAndSelect('bid.user', 'user') // Join với bảng user
      .where('bid.auctionSlug = :slug', { slug })
      .orderBy('bid.amount', 'DESC') // Sắp xếp theo số tiền giảm dần
      .getMany();

    // Map danh sách các bids để chỉ lấy thông tin cần thiết
    const formattedBids = bids.map((bid) => ({
      amount: bid.amount,
      username: bid.user.username,
      createdAt: bid.createdAt,
    }));

    return {
      highest_bid: auction.highest_bid, // Giá cao nhất
      numOfBid: bids.length, // Số lượng người đặt giá
      bids: formattedBids, // Danh sách các bids
    };
  }
}
