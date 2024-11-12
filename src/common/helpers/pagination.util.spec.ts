import { paginate, PaginatedResult } from './pagination.util';

describe('paginate', () => {
  let queryBuilderMock: any;

  beforeEach(() => {
    queryBuilderMock = {
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };
  });

  it('should return paginated data correctly', async () => {
    // Dữ liệu giả để kiểm tra
    const data = [
      { id: 1, name: 'Category1' },
      { id: 2, name: 'Category2' },
    ];
    const total = 20;

    // Định nghĩa hàm giả `getManyAndCount` để trả về kết quả dự kiến
    queryBuilderMock.getManyAndCount.mockResolvedValueOnce([data, total]);

    const page = 1;
    const limit = 10;

    // Gọi hàm paginate và truyền vào queryBuilder giả
    const result = await paginate(page, limit, queryBuilderMock);

    // Kiểm tra kết quả trả về có đúng không
    expect(result).toEqual<PaginatedResult<any>>({
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });

    // Kiểm tra nếu `take` và `skip` được gọi đúng số lần với tham số chính xác
    expect(queryBuilderMock.take).toHaveBeenCalledWith(limit);
    expect(queryBuilderMock.skip).toHaveBeenCalledWith((page - 1) * limit);
  });

  it('should throw an error if page is not a positive integer', async () => {
    await expect(paginate(0, 10, queryBuilderMock)).rejects.toThrow(
      'Page must be a positive integer.',
    );
  });

  it('should throw an error if limit is not a positive integer', async () => {
    await expect(paginate(1, 0, queryBuilderMock)).rejects.toThrow(
      'Limit must be a positive integer.',
    );
  });

  it('should throw an error if queryBuilder is invalid', async () => {
    await expect(paginate(1, 10, {})).rejects.toThrow(
      'Invalid queryBuilder provided.',
    );
  });
});
