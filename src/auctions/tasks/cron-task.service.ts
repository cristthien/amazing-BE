import { InvoiceService } from './../../invoice/invoice.service';
import { AuctionStatus } from '@/src/common/enums/index';
import { Injectable } from '@nestjs/common';
import { Auction } from '../entities/auction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from '@/src/bid/entities/bid.entity';

@Injectable()
export class AuctionCronService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    private readonly invoiceService: InvoiceService,
  ) {}
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
      console.log(`${updatedAuctions.length} auctions were updated.`);
    } catch (error) {
      console.error('Error updating auctions by end date:', error);
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
