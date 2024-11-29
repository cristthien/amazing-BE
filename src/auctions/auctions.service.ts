import { AuctionTasksActiveService } from './tasks/auction-tasks-active.service';
import { InvoiceService } from './../invoice/invoice.service';
import { AuctionCreateDto } from './dto/create-auction.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
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
import { AuctionTasksService } from './tasks/auction-tasks.service';

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
    private readonly auctionTasksService: AuctionTasksService,
    private readonly auctionTasksActiveService: AuctionTasksActiveService,
  ) {}

  async createAuction(createAuctionDto: AuctionCreateDto): Promise<Auction> {
    // Generate the base slug from the name
    const baseSlug = slugify(createAuctionDto.name, {
      lower: true,
      remove: /[^\w\s-]/g,
    });

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
    const newAuction = await this.auctionRepository.save(auction);

    await this.auctionTasksActiveService.scheduleNextAuctionTask();
    await this.auctionTasksService.scheduleNextAuctionTask();
    // Save the auction and return it
    return newAuction;
  }

  async getAuctionsByCategory(
    categoryId: number,
    page: number,
    limit: number,
  ): Promise<{ category: any; auctions: PaginatedResult<Auction> }> {
    // Kiểm tra xem category có tồn tại không
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Truy vấn danh sách auction với các trường cần thiết
    const queryBuilder = this.auctionRepository
      .createQueryBuilder('auction')
      .where('auction.category_id = :categoryId', { categoryId })
      .select([
        'auction.name',
        'auction.images',
        'auction.highest_bid',
        'auction.status',
        'auction.slug',
      ]);

    // Sử dụng paginate utility function để phân trang kết quả của auctions
    const auctions = await paginate<Auction>(page, limit, queryBuilder);

    // Trả về kết quả với thông tin category và danh sách auctions
    return {
      category: category,
      auctions: auctions,
    };
  }
  async searchAuctions(key: string) {
    try {
      const searchKey = key.trim().toLowerCase();

      // Tạo query tìm kiếm trên nhiều trường
      const queryBuilder = this.auctionRepository
        .createQueryBuilder('auction')
        .where('LOWER(auction.name) LIKE :key', { key: `%${searchKey}%` })
        .orWhere('LOWER(auction.description) LIKE :key', {
          key: `%${searchKey}%`,
        })
        .select(['auction.name', 'auction.slug', 'auction.images']); // Chỉ lấy những trường cần thiết

      // Lấy kết quả từ cơ sở dữ liệu
      const results = await queryBuilder.getMany();

      // Chuyển đổi danh sách kết quả để trả về chỉ một ảnh (phần tử đầu tiên trong `images`)
      const refinedResults = results.map((auction) => ({
        name: auction.name,
        slug: auction.slug,
        image: auction.images?.[0] || null, // Lấy ảnh đầu tiên hoặc null nếu không có ảnh
      }));

      return refinedResults;
    } catch (error) {
      console.error('Error searching auctions:', error);
      throw new Error('Failed to search auctions. Please try again later.');
    }
  }

  async getAuctionsSuggest(categoryId: number) {
    try {
      // Create a query builder for the auction repository
      const queryBuilder = this.auctionRepository
        .createQueryBuilder('auction')
        .select([
          'auction.name',
          'auction.highest_bid',
          'auction.images',
          'auction.slug',
          'auction.category_id',
        ]) // Select specific fields
        .where('auction.category_id = :categoryId', { categoryId }) // Filter by category
        .andWhere('auction.status = :status', { status: 'active' }) // Filter by active status
        .orderBy('RANDOM()') // Randomize the order of results (PostgreSQL)
        .limit(10); // Limit to 10 results

      // Execute the query to fetch the auctions
      const auctions = await queryBuilder.getMany();
      return auctions.map((auction) => ({
        name: auction.name,
        highest_bid: auction.highest_bid,
        image: auction.images[0],
        slug: auction.slug,
      })); // Return only the selected fields
    } catch (error) {
      console.error('Error in getAuctionsSuggest:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async findAll(page: number, limit: number) {
    const queryBuilder = this.auctionRepository.createQueryBuilder('auction');

    // Join the category and user relations
    queryBuilder
      .select([
        'auction.id', // ID của đấu giá
        'auction.slug', // ID của đấu giá
        'auction.name', // Tên đấu giá
        'auction.highest_bid', // Giá cao nhất
        'auction.status', // Trạng thái
        'auction.condition', // Tình trạng sản phẩm
        'category.name', // Tên danh mục
        'user.username', // Tên người dùng tạo đấu giá
      ])
      .leftJoin('auction.category', 'category') // Tham gia bảng category
      .leftJoin('auction.user', 'user'); // Tham gia bảng user
    const paginatedResult = await paginate<any>(page, limit, queryBuilder);

    const refinedData = paginatedResult.data.map((auction) => ({
      id: auction.id,
      slug: auction.slug,
      name: auction.name,
      highestBid: auction.highest_bid,
      status: auction.status,
      condition: auction.condition,
      categoryName: auction.category.name, // Tên danh mục
      username: auction.user.username, // Tên người tạo
    }));

    return {
      ...paginatedResult,
      data: refinedData,
    };
  }
  async getNewListing() {
    try {
      // Create a query builder for the auction repository
      const queryBuilder = this.auctionRepository.createQueryBuilder('auction');

      // Apply filters, sorting, and field selection
      queryBuilder
        .select([
          'auction.name',
          'auction.highest_bid',
          'auction.images',
          'auction.slug',
        ]) // Select specific fields
        .where('auction.status = :status', { status: 'active' }) // Filter by active status
        .orderBy('auction.start_date', 'DESC') // Sort by start_date in ascending order (newest first)
        .limit(10); // Limit the results to the 10 most recent auctions
      // Execute the query and return the results
      const auctions = await queryBuilder.getMany(); // Fetch the auctions
      console.log(auctions[0]);
      const formattedAuctions = auctions.map((auction) => ({
        name: auction.name,
        highest_bid: auction.highest_bid,
        image: auction.images ? auction.images[0] : 'No image available', // Handle case where no image exists
        slug: auction.slug,
      }));

      return formattedAuctions; // Return the array of auctions
    } catch (error) {
      console.error('Error in getNewListing:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
  async explore() {
    try {
      // Create a query builder for the auction repository
      const queryBuilder = this.auctionRepository.createQueryBuilder('auction');

      // Apply filters and field selection
      const auctions = await queryBuilder
        .select([
          'auction.name',
          'auction.highest_bid',
          'auction.images',
          'auction.slug',
        ]) // Select specific fields
        .where('auction.status = :status', { status: 'active' }) // Filter by active status
        .getMany(); // Fetch all active auctions

      // Inline shuffling using Fisher-Yates Algorithm
      for (let i = auctions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Generate random index
        [auctions[i], auctions[j]] = [auctions[j], auctions[i]]; // Swap elements
      }

      // Limit the shuffled auctions to 10 items
      const limitedAuctions = auctions.slice(0, 10);

      // Format the result to ensure proper image handling
      const formattedAuctions = limitedAuctions.map((auction) => ({
        name: auction.name,
        highest_bid: auction.highest_bid,
        image: auction.images?.[0] || 'No image available', // Handle case where no image exists
        slug: auction.slug,
      }));

      return formattedAuctions; // Return the formatted list of random auctions
    } catch (error) {
      console.error('Error in explore:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
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
    const updatedAuction = await this.auctionRepository.save(auction);

    await this.auctionTasksActiveService.scheduleNextAuctionTask();
    await this.auctionTasksService.scheduleNextAuctionTask();

    // Lưu lại và trả về phiên đấu giá đã cập nhật
    return updatedAuction;
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
      .select(['auction.highest_bid', 'auction.status', 'user.id'])
      .where('auction.slug = :slug', { slug })
      .getOne();

    if (!auction) {
      throw new NotFoundException(`Auction with slug '${slug}' not found`);
    }

    // Return the highest bid along with user id
    return {
      highest_bid: auction.highest_bid,
      user_id: auction.user ? auction.user.id : null,
      status: auction.status, // Check if user exists
    };
  }
  remove(id: number) {
    return `This action removes a #${id} auction`;
  }
  async getAllAuctionsByUserID(
    id: string,
    user: UserPayload,
    page: number,
    limit: number,
  ) {
    // Use a query builder to filter auctions based on user ID
    const queryBuilder = this.auctionRepository
      .createQueryBuilder('auction')
      .leftJoinAndSelect('auction.user', 'user')
      .where('auction.userId = :userId', { userId: id })
      // Select specific fields for the auction
      .select([
        'auction.id', // Select 'id' field
        'auction.slug', // Select 'slug' field
        'auction.name', // Select 'name' field
        'auction.start_date', // Select 'start_date' field
        'auction.end_date', // Select 'end_date' field
        'auction.highest_bid', // Select 'highest_bid' field
        'auction.images', // Select 'images' field
      ])
      .orderBy('auction.start_date', 'DESC');

    // Apply pagination using a helper function
    const paginatedResult = await paginate<Auction>(page, limit, queryBuilder);

    // Get the data from the paginated result
    const data = paginatedResult.data;

    // Refine the data by mapping over it
    const refinedData = data.map((item) => {
      const image = item.images[0]; // Get the first image
      delete item.images; // Delete the images array
      return { image: image, ...item }; // Add the first image as 'image' and spread the other fields
    });
    delete paginatedResult.data;

    // Return the refined data correctly
    return {
      data: refinedData, // Ensure 'data' is an array of refined auction objects
      ...paginatedResult, // Optionally include other paginated result data (such as pagination info)
    };
  }
}
