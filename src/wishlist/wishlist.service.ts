import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from '../auctions/entities/auction.entity';
import { Wishlist } from './entities/wishlist.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async addToWishlist(createWishlistDto: CreateWishlistDto): Promise<Wishlist> {
    const { auctionId, userId } = createWishlistDto;

    // Validate if auction and user exist
    const auction = await this.auctionRepository.findOne({
      where: { id: +auctionId }, // Find auction by id
    });

    const user = await this.userRepository.findOne({
      where: { id: +userId }, // Find user by id
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create a new wishlist entry with full objects
    const wishlist = this.wishlistRepository.create({
      user,
      auction,
    });

    return this.wishlistRepository.save(wishlist);
  }

  findAll() {
    return `This action returns all wishlist`;
  }

  findOne(id: number) {
    return `This action returns a #${id} wishlist`;
  }

  // update(id: number, updateWishlistDto: UpdateWishlistDto) {
  //   return `This action updates a #${id} wishlist`;
  // }

  remove(id: number) {
    return `This action removes a #${id} wishlist`;
  }
}
