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
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from '../common/decorator/customize';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { RolesGuard } from '../auth/passport/roles.guard';
import { Roles } from '../common/decorator/roles.decorator';
import { ImageUploadInterceptor } from '../interceptors/image-upload.interceptor';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Post()
  @Public()
  @UseInterceptors(ImageUploadInterceptor.upload('thumbnail')) // Sử dụng interceptor cho trường 'thumbnail'
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File, // Lấy file đã upload
  ) {
    if (file) {
      createCategoryDto.thumbnail = `/public/images/${file.filename}`; // Lưu đường dẫn file
    }
    // Gọi service để tạo category và lưu vào DB
    const category = await this.categoriesService.create(createCategoryDto);
    return category;
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
