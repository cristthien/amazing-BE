import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { AuctionsService } from '@/src/auctions/auctions.service';
import UserPayload from '@/src/common/dto/user-payload.dto';
import { paginate } from '../common/helpers/pagination.util';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    private auctionService: AuctionsService,
  ) {}
  async addToWishlist(createWishlistDto: CreateWishlistDto, user: UserPayload) {
    const { auctionSlug } = createWishlistDto;

    // Validate if auction exists
    const auction = await this.auctionService.findOnlyAuction(auctionSlug);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    // Check if the wishlist entry already exists for this user and auction
    const existingWishlist = await this.wishlistRepository
      .createQueryBuilder('wishlist')
      .where('wishlist.user_id = :userId', { userId: user.id })
      .andWhere('wishlist.auction = :auctionId', { auctionId: auction.id })
      .getOne();

    if (existingWishlist) {
      throw new BadRequestException(
        'This auction is already in your wishlist.',
      );
    }

    // Create a new wishlist entry
    const wishlist = this.wishlistRepository.create({
      user_id: `${user.id}`,
      auction,
    });

    try {
      // Save wishlist to the database
      const savedWishlist = await this.wishlistRepository.save(wishlist);

      // Return only the required fields
      return {
        user_id: savedWishlist.user_id,
        auction: {
          description: auction.description,
          name: auction.name,
          slug: auction.slug,
          images: auction.images,
        },
      };
    } catch (error) {
      // Handle any database or internal errors
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOneByUserIdAndSlug(userId: string, slug: string) {
    const auction = await this.auctionService.findOnlyAuction(slug);
    if (!auction) {
      throw new NotFoundException('Acution not have');
    }
    const wishlist = await this.wishlistRepository.findOne({
      where: { user_id: userId, auction },
    });

    if (!wishlist) {
      throw new NotFoundException(
        `Wishlist with slug '${slug}' not found for user ID ${userId}`,
      );
    }

    return wishlist;
  }
  async GetAllWishlist(userId: string, page: number, limit: number) {
    try {
      // Create a query builder for the 'wishlist' table
      const queryBuilder = this.wishlistRepository
        .createQueryBuilder('wishlist')
        .leftJoinAndSelect('wishlist.auction', 'auction') // Perform LEFT JOIN with the 'auction' table
        .where('wishlist.user_id = :userId', { userId })
        .select([
          'wishlist.id',
          'auction.name',
          'auction.images',
          'auction.slug',
          'auction.highest_bid',
        ]);

      // Apply pagination by setting 'skip' and 'take'
      const paginatedResult = await paginate(page, limit, queryBuilder);

      // Check if results were found
      if (!paginatedResult) {
        throw new Error('No wishlists found for this user');
      }

      return paginatedResult;
    } catch (e) {
      throw new InternalServerErrorException(
        `There was a problem fetching the wishlists: ${e.message}`,
      );
    }
  }

  async remove(id: number, user: UserPayload) {
    // Check if the wishlist belongs to the user
    // Find the wishlist by ID
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
    });

    if (!wishlist) {
      throw new Error('Wishlist not found');
    }

    // Ensure the wishlist belongs to the user
    if (wishlist.user_id !== `${user.id}`) {
      throw new Error('You are not authorized to delete this wishlist');
    }
    try {
      // Proceed to delete the wishlist
      await this.wishlistRepository.delete(id);
    } catch (e) {
      throw new InternalServerErrorException(
        `There was a problem deleting the wishlist: ${e.message}`,
      );
    }

    return `Wishlist with id '${id}' has been successfully removed`;
  }
}
