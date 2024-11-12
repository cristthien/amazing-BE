import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
// response.dto.ts
export class ResponseDto {
  statusCode: number;
  message: string;
  data: any;

  constructor(statusCode: number, message: string, data: any) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            create: jest.fn().mockResolvedValue({
              id: 12,
              name: 'maboook',
              description: 'giathien',
              thumbnail: null,
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should create a category and return a standardized response', async () => {
    const createCategoryDto: CreateCategoryDto = {
      name: 'maboook',
      description: 'giathien',
    };

    const result = await controller.create(createCategoryDto, null);

    expect(result).toEqual(
      new ResponseDto(200, 'Request successful', {
        id: 12,
        name: 'maboook',
        description: 'giathien',
        thumbnail: null,
      }),
    );
    expect(service.create).toHaveBeenCalledWith(createCategoryDto);
  });
});
