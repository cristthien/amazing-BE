import { InvoiceService } from './../../invoice/invoice.service';
import { AuctionStatus } from '@/src/common/enums/index';
import { Injectable } from '@nestjs/common';
import { Auction } from '../entities/auction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from '@/src/bid/entities/bid.entity';
import { Wishlist } from '@/src/wishlist/entities/wishlist.entity';

@Injectable()
export class AuctionCronService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly invoiceService: InvoiceService,
  ) {}
  async removeAllWishlistbyslug(slug: string) {
    try {
      const wishlistItems = await this.wishlistRepository
        .createQueryBuilder('wishlist')
        .innerJoin('wishlist.auction', 'auction') // Explicitly join the auction table
        .where('auction.slug = :slug', { slug }) // Filter by auction slug
        .getMany(); // Fetch the matching wishlist items

      console.log('Wishlist items to remove:', wishlistItems); // Log the items for debugging

      if (wishlistItems.length === 0) {
        console.log(`No wishlist items found for auction slug: ${slug}`);
        return; // Exit early if no items are found
      }

      // Step 2: Delete the wishlist items by their IDs
      const idsToDelete = wishlistItems.map((item) => item.id); // Get all IDs of the wishlist items

      const result = await this.wishlistRepository
        .createQueryBuilder('wishlist')
        .delete() // Perform the delete operation
        .where('wishlist.id IN (:...ids)', { ids: idsToDelete }) // Delete using the IDs
        .execute(); // Execute the query

      console.log(
        `${result.affected} wishlist items removed for auction slug: ${slug}`,
      );
      return result; // Returns the result of the delete operation
    } catch (error) {
      console.error('Error removing wishlist items:', error);
      throw new Error('Could not remove wishlist items');
    }
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
      const nearestAuction = await this.auctionRepository
        .createQueryBuilder('auction')
        .where('auction.status = :status', { status: AuctionStatus.ACTIVE })
        .orderBy('auction.end_date', 'ASC')
        .limit(1)
        .getOne();

      if (!nearestAuction) {
        return { end_date: null };
      }

      return { target_time: nearestAuction.end_date };
    } catch (error) {
      console.error('Error fetching nearest auction end date:', error);
      throw new Error('Could not fetch auctions');
    }
  }

  async updateStatusByEndDate(endDate: Date) {
    const queryRunner =
      this.auctionRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const auctionsToUpdate = await this.auctionRepository.find({
        where: { end_date: endDate, status: AuctionStatus.ACTIVE },
      });

      if (auctionsToUpdate.length === 0) {
        console.log('No active auctions found with the specified end date.');
        return [];
      }

      const updatedAuctions = await Promise.all(
        auctionsToUpdate.map(async (auction) => {
          auction.status = AuctionStatus.CLOSED;
          await this.removeAllWishlistbyslug(auction.slug);

          if (auction.starting_bid == auction.highest_bid) {
            return auction;
          }
          const highestBid = await this.getHighestBid(auction.slug);
          if (highestBid) {
            await this.invoiceService.create(`${highestBid.userId}`, auction);
          }

          return auction;
        }),
      );
      await this.auctionRepository.save(updatedAuctions);
      await queryRunner.manager.save(updatedAuctions);

      // Commit transaction nếu mọi thứ đều ổn
      await queryRunner.commitTransaction();

      console.log(`${updatedAuctions.length} auctions were updated.`);
    } catch (error) {
      console.error('Error updating auctions by end date:', error);
      await queryRunner.release();
      throw new Error('Could not update auctions');
    }
  }

  async getNearestStartDate() {
    try {
      const nearestAuction = await this.auctionRepository
        .createQueryBuilder('auction')
        .where('auction.status = :status', { status: AuctionStatus.PENDING })
        .orderBy('auction.start_date', 'ASC')
        .limit(1)
        .getOne();

      if (!nearestAuction) {
        return { start_date: null };
      }

      return { target_time: nearestAuction.start_date };
    } catch (error) {
      console.error('Error fetching nearest auction start date:', error);
      throw new Error('Could not fetch auctions');
    }
  }

  async updateStatusByStartDate(startDate: Date) {
    try {
      const updateResult = await this.auctionRepository
        .createQueryBuilder()
        .update(Auction)
        .set({ status: AuctionStatus.ACTIVE })
        .where('start_date = :startDate', { startDate })
        .execute();

      if (updateResult.affected === 0) {
        console.log('No auctions found with the specified start date.');
      } else {
        console.log(`${updateResult.affected} auctions were updated.`);
      }
    } catch (error) {
      console.error('Error updating auctions by start date:', error);
      throw new Error('Could not update auctions');
    }
  }
}
