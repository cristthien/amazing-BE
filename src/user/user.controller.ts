import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserDto from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Create a new user
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.create(createUserDto);
  }

  // Get all users
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    // Lấy các tham số page và limit từ query string
    const { page, limit } = paginationDto;

    // Gọi phương thức findAll() từ service và truyền các tham số phân trang
    return this.userService.findAll(page, limit);
  }

  // Get a single user by ID
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User> {
    return await this.userService.findOne(id);
  }

  // Update a user by ID
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.update(id, updateUserDto);
  }

  // Delete a user by ID
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return await this.userService.remove(id);
  }
}
