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
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiMultiFile } from '../interceptors/image-upload-swagger.interceptor';
import { Public } from '../common/decorator/customize';

@ApiTags('3 - Categories')
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
  @Public()
  @ApiOperation({
    summary: 'Retrieve all categories',
    description:
      'Get a list of all categories. This endpoint is publicly accessible.',
  })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Retrieve category details by ID',
    description: 'Get detailed information about a category using its ID.',
  })
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(+id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }
    return category;
  }

  @Get(':id/auctions')
  @Public()
  @ApiOperation({
    summary: 'Retrieve auctions for a specific category',
    description:
      'Get a paginated list of auctions belonging to a specific category using its ID.',
  })
  async getAuctionsByCategory(
    @Param('id') categoryId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.auctionsService.getAuctionsByCategory(
      categoryId,
      +page,
      +limit,
    );
  }
  @Get(':id/suggest')
  @Public()
  @ApiOperation({
    summary: 'Get suggested auctions for a specific category',
    description:
      'Retrieve a list of suggested auctions related to a specific category.',
  })
  async getAuctionsSuggest(@Param('id') categoryId: number) {
    return this.auctionsService.getAuctionsSuggest(categoryId);
  }

  @Patch(':id')
  @Roles('admin') // Restrict this endpoint to 'admin' role
  @ApiOperation({
    summary: 'Update a category by ID',
    description:
      'Update details of an existing category by its ID. Only admins can perform this action. Optionally, you can upload a new thumbnail image.',
  })
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
  @ApiOperation({
    summary: 'Delete a category by ID',
    description:
      'Delete an existing category using its ID. Only admins can perform this action.',
  })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
