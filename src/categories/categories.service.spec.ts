import { Category } from './entities/category.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: any; // Mock repository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            create: jest.fn().mockReturnValue({}),
            save: jest.fn().mockResolvedValue({
              id: 1,
              name: 'maboook',
              description: 'giathien',
              thumbnail: null,
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get(getRepositoryToken(Category)); // Lấy mock repository
  });

  describe('create', () => {
    it('should create a category and return the created category', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'maboook',
        description: 'giathien',
      };

      const result = await service.create(createCategoryDto);

      // Kiểm tra kết quả trả về có đúng như mong đợi
      expect(result).toEqual({
        id: 1,
        name: 'maboook',
        description: 'giathien',
        thumbnail: null,
      });

      // Kiểm tra xem phương thức create có được gọi với tham số đúng không
      expect(repository.create).toHaveBeenCalledWith(createCategoryDto);

      // Kiểm tra xem phương thức save có được gọi không
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw an error if create fails', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'maboook',
        description: 'giathien',
      };

      // Giả lập lỗi khi gọi phương thức save
      repository.save.mockRejectedValue(new Error('Error creating category'));

      // Kiểm tra xem có lỗi xảy ra khi gọi phương thức create không
      await expect(service.create(createCategoryDto)).rejects.toThrowError(
        'Error creating category',
      );
    });
  });
});
