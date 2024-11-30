import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

import { AuctionsService } from '../auctions/auctions.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) // Inject repository for Category entity
    private readonly categoriesRepository: Repository<Category>, // Use the repository to interact with the database
    private readonly auctionsService: AuctionsService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Kiểm tra xem category với name đã tồn tại chưa
    const existingCategory = await this.categoriesRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      // Nếu tên category đã tồn tại, ném lỗi với thông báo cụ thể
      throw new HttpException(
        `Category with name '${createCategoryDto.name}' already exists.`,
        HttpStatus.BAD_REQUEST, // Trả về mã trạng thái 400
      );
    }

    try {
      // Tạo và lưu category mới
      const category = this.categoriesRepository.create(createCategoryDto);
      return await this.categoriesRepository.save(category);
    } catch (error) {
      console.error('Error creating category:', error);
      // Ném lỗi chung khi không thể tạo category
      throw new HttpException(
        'Error creating category',
        HttpStatus.INTERNAL_SERVER_ERROR, // Trả về mã trạng thái 500
      );
    }
  }
  // Find all categories
  async findAll() {
    try {
      const queryBuilder =
        this.categoriesRepository.createQueryBuilder('categories');

      // Chạy hàm paginate
      return queryBuilder.getMany();
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async findOne(id: number): Promise<Category> {
    // Kiểm tra id có hợp lệ không
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('ID must be a positive integer.');
    }

    try {
      // Thực hiện tìm kiếm category theo id
      const category = await this.categoriesRepository.findOne({
        where: { id: id },
      });

      // Kiểm tra xem có kết quả không
      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      return category;
    } catch (error) {
      // Xử lý các lỗi bất ngờ và ghi lại log
      throw new Error(`An unexpected error occurred ${error.message}`);
    }
  }

  async updateCategory(
    categoryId: number,
    updateCategoryDto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ): Promise<Category> {
    try {
      // Retrieve the existing category from the database
      const existingCategory = await this.categoriesRepository.findOne({
        where: { id: categoryId },
      });

      // If the category does not exist, throw a NotFoundException
      if (!existingCategory) {
        throw new NotFoundException(
          `Category with ID ${categoryId} not found.`,
        );
      }

      // If a new file is uploaded, update the 'thumbnail' field
      if (file) {
        updateCategoryDto.thumbnail = `/public/images/${file.filename}`;
      }

      // Retain the current values for fields that are not provided in the request body
      const updatedCategory = Object.assign(
        existingCategory,
        updateCategoryDto,
      );

      // Save the updated category to the database
      return await this.categoriesRepository.save(updatedCategory);
    } catch (error) {
      // If an unexpected error occurs, throw an InternalServerErrorException
      console.error('Error updating category in service:', error);
      throw new InternalServerErrorException(
        'An error occurred while updating the category.',
      );
    }
  }

  // Remove a category by ID
  async remove(id: number): Promise<void> {
    await this.categoriesRepository.delete(id);
  }
}
