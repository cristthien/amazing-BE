import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import CreateUserDto from './dto/create-user.dto';
import { ConflictException } from '@nestjs/common';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { HashPasswordHelper } from 'src/common/helpers/utils';
import { paginate } from '../common/helpers/pagination.util';
import UpdateUserDto from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Kiểm tra nếu email đã tồn tại
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      // Thay vì trả về statusCode 200, trả về 409 Conflict khi có lỗi
      throw new ConflictException('Email already exists');
    }

    // Hash the password before saving the user
    const cipherPassword = await HashPasswordHelper(createUserDto.password);

    // Create a new user with the hashed password
    const user = this.userRepository.create({
      ...createUserDto,
      password: cipherPassword, // Set the hashed password
    });

    return this.userRepository.save(user);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<User>> {
    return paginate<User>(
      page,
      limit,
      this.userRepository.createQueryBuilder('user'),
    );
  }

  // Get a user by ID
  async findOne(id: number): Promise<User> {
    // Check if the ID is null or undefined
    if (!id) {
      throw new BadRequestException('User ID cannot be null or undefined');
    }

    // Retrieve the user from the database
    const user = await this.userRepository.findOne({ where: { id } });

    // Check if the user is found
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
  // Get a user by email
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // // Update a user by ID
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id); // Return the updated user
  }

  // Delete a user by ID
  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('User not found');
  }
}
