// src/common/interfaces/paginated-result.interface.ts

export interface PaginatedResult<T> {
  data: T[]; // Dữ liệu phân trang
  total: number; // Tổng số bản ghi
  currentPage: number; // Trang hiện tại
  totalPages: number; // Tổng số trang
}
