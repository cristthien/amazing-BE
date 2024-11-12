import { AuctionsService } from './../auctions/auctions.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
// import { Public } from '../common/decorator/customize';
import { Roles } from '../common/decorator/roles.decorator';
import { ImageUploadInterceptor } from '../interceptors/image-upload.interceptor';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiMultiFile } from '../interceptors/image-upload-swagger.interceptor';
import { Public } from '../common/decorator/customize';
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly auctionsService: AuctionsService,
  ) {}
  @Post()
  @Roles('admin')
  @UseInterceptors(ImageUploadInterceptor.upload('thumbnail'))
  @ApiOperation({ summary: 'Create a new category with multiple images' })
  @ApiConsumes('multipart/form-data') // Indicating that this API consumes multipart/form-data (file upload)
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    schema: {
      example: {
        statusCode: 201,
        message: 'Category created successfully',
        data: {
          name: 'macbook',
          description: 'This is a lineup of Macbook Pro',
          thumbnail: '/public/images/abc123.jpg',
          id: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Category with the same name already exists',
  })
  @ApiMultiFile('thumbnails')
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File, // Lấy file đã upload
  ) {
    if (file) {
      createCategoryDto.thumbnail = `/public/images/${file.filename}`; // Lưu đường dẫn file
    }
    console.log(file); // Log the uploaded file to check if it's received
    console.log(createCategoryDto); // Log the category DTO
    // Gọi service để tạo category và lưu vào DB
    const category = await this.categoriesService.create(createCategoryDto);

    return category;
  }

  @Get()
  @Roles('admin') // Restrict this endpoint to 'admin' role
  async findAll(
    @Query('page') page: number = 1, // Default page is 1
    @Query('limit') limit: number = 10, // Default limit is 10
  ) {
    return this.categoriesService.findAll(page, limit);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(+id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }
    return category;
  }

  @Get(':id/auctions')
  async getAuctionsByCategory(
    @Param('id') categoryId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.auctionsService.getAuctionsByCategory(categoryId, page, limit);
  }

  @Patch(':id')
  @Roles('admin') // Restrict this endpoint to 'admin' role
  @UseInterceptors(ImageUploadInterceptor.upload('thumbnail')) // Use interceptor for 'thumbnail' field
  async update(
    @Param('id') id: string, // Get category ID from the route parameter
    @Body() updateCategoryDto: UpdateCategoryDto, // Get the updated category data from the request body
    @UploadedFile() file: Express.Multer.File, // Get uploaded file
  ) {
    try {
      // Delegate the update logic to the service
      const updatedCategory = await this.categoriesService.updateCategory(
        +id, // Convert ID to number
        updateCategoryDto, // The updated category data
        file, // The uploaded file (if any)
      );

      // Return the updated category
      return updatedCategory;
    } catch (error) {
      // If an unexpected error occurs, throw an InternalServerErrorException
      console.error('Error updating category:', error);
      throw new InternalServerErrorException(
        'An error occurred while updating the category.',
      );
    }
  }
  @Delete(':id')
  @Roles('admin') // Restrict this endpoint to 'admin' role
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
