// src/common/utils/pagination.util.ts
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  currentPage: number;
  totalPages: number;
}
export async function paginate<T>(
  page: number,
  limit: number,
  queryBuilder: any,
): Promise<PaginatedResult<T>> {
  // Kiểm tra tính hợp lệ của page và limit
  if (!Number.isInteger(page) || page <= 0) {
    throw new Error('Page must be a positive integer.');
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error('Limit must be a positive integer.');
  }

  // Kiểm tra tính hợp lệ của queryBuilder
  if (
    !queryBuilder ||
    typeof queryBuilder.take !== 'function' ||
    typeof queryBuilder.skip !== 'function'
  ) {
    console.error('Invalid queryBuilder:', queryBuilder);
    throw new Error('Invalid queryBuilder provided.');
  }

  const offset = (page - 1) * limit;

  // Thực hiện phân trang và xử lý lỗi chi tiết hơn
  try {
    const [data, total] = await queryBuilder
      .take(limit) // Số lượng bản ghi mỗi trang
      .skip(offset) // Tính toán vị trí bắt đầu
      .getManyAndCount();

    if (data === null || data === undefined) {
      throw new Error('No data found.');
    }

    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit), // Tính toán tổng số trang
    };
  } catch (error) {
    console.error('Pagination error:', error);
    throw new Error(
      `An error occurred while fetching paginated data: ${error.message}`,
    );
  }
}
