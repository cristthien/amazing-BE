import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) // Inject repository for Category entity
    private readonly categoriesRepository: Repository<Category>, // Use the repository to interact with the database
  ) {}

  // Create a new category
  create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this.categoriesRepository.create(createCategoryDto);
      return this.categoriesRepository.save(category);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error; // Re-throw error if necessary
    }
  }

  // Find all categories
  findAll() {
    return this.categoriesRepository.find();
  }

  // Find a category by ID
  findOne(id: number) {
    return this.categoriesRepository.findOne({ where: { id } });
  }

  // Update a category by ID
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    await this.categoriesRepository.update(id, updateCategoryDto);
    return this.findOne(id);
  }

  // Remove a category by ID
  async remove(id: number): Promise<void> {
    await this.categoriesRepository.delete(id);
  }
}
