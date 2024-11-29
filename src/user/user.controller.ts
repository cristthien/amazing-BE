import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  Body,
  Put,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { RolesGuard } from '../auth/passport/roles.guard';
import { Roles } from '../common/decorator/roles.decorator';
import UpdateUserDto from './dto/update-user.dto';
import { UserRole } from '../common/enums';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('2 - Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get all users
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Retrieve all users',
    description: 'Get a paginated list of all users. Requires admin access.',
  })
  @Roles('admin')
  async findAll(@Query() paginationDto: PaginationDto) {
    // Lấy các tham số page và limit từ query string
    const { page, limit } = paginationDto;

    // Gọi phương thức findAll() từ service và truyền các tham số phân trang
    return this.userService.findAll(page, limit);
  }

  // Get a single user by ID
  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a specific user',
    description:
      'Get the details of a single user by their ID. Requires admin access.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: number): Promise<User> {
    return await this.userService.findOne(id);
  }

  // Update a user by ID
  @Put(':id')
  @Roles('user')
  @ApiOperation({
    summary: 'Update user information',
    description:
      'Update user details by ID. Regular users can only update their own information. Admins can update any user.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    const { user } = req;
    if (id !== `${user.id}` && user.role !== UserRole.Admin) {
      throw new BadRequestException(
        'You do not have permission to access this resource',
      );
    }
    console.log(updateUserDto);
    return await this.userService.update(Number(id), updateUserDto);
  }

  // Delete a user by ID
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user',
    description:
      'Delete a user by their ID. Regular users cannot delete their account, only admins can perform this action.',
  })
  async remove(@Param('id') id: number): Promise<void> {
    return await this.userService.remove(id);
  }
}
