// src/common/utils/pagination.util.ts
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export function paginate<T>(
  page: number,
  limit: number,
  queryBuilder: any,
): Promise<PaginatedResult<T>> {
  // Kiểm tra xem page và limit có hợp lệ không
  if (!Number.isInteger(page) || page <= 0) {
    throw new Error('Page must be a positive integer.');
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error('Limit must be a positive integer.');
  }

  // Kiểm tra queryBuilder có hợp lệ không
  if (
    !queryBuilder ||
    typeof queryBuilder.take !== 'function' ||
    typeof queryBuilder.skip !== 'function'
  ) {
    throw new Error('Invalid queryBuilder provided.');
  }

  const offset = (page - 1) * limit;

  // Thực hiện phân trang và xử lý lỗi
  return queryBuilder
    .take(limit) // Số lượng bản ghi mỗi trang
    .skip(offset) // Tính toán vị trí bắt đầu
    .getManyAndCount()
    .then(([data, total]) => {
      if (!data) {
        throw new Error('No data found.');
      }

      return {
        data,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit), // Tính toán tổng số trang
      };
    })
    .catch((error) => {
      // Xử lý các lỗi có thể phát sinh
      console.error('Pagination error:', error);
      throw new Error('An error occurred while fetching paginated data.');
    });
}
