import { Auction } from '@/src/auctions/entities/auction.entity';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Repository } from 'typeorm';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import UserPayload from '../common/dto/user-payload.dto';
import { paginate } from '../common/helpers/pagination.util';
import { UserRole } from '../common/enums';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}
  async create(userID: string, auction: Auction) {
    // Kiểm tra nếu đã có invoice cho userID và auction
    const existingInvoice = await this.invoiceRepository.findOne({
      where: { userID, auction: { id: auction.id } },
    });

    // Nếu đã tồn tại, trả về invoice hiện có và không tạo mới
    if (existingInvoice) {
      return existingInvoice;
    }

    // Tạo invoice mới nếu chưa tồn tại
    const invoice = this.invoiceRepository.create({
      userID,
      auction,
      amount: Number(auction.highest_bid), // Assuming 'amount' is based on auction's price
      status: 'pending', // Default status for a new invoice
      createdAt: new Date(),
    });

    // Lưu invoice mới vào database
    return this.invoiceRepository.save(invoice);
  }
  async findAll(user: UserPayload, page: number, limit: number) {
    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoin('invoice.auction', 'auction') // Left Join với Auction
      .select([
        'invoice.id',
        'invoice.userID',
        'invoice.amount',
        'invoice.status',
        'invoice.paidAt',
        'invoice.paymentMethod',
        'invoice.address',
        'invoice.phoneNumber',
        'auction.id',
        'auction.name',
        'auction.slug',
        'auction.images',
        'invoice.createdAt',
      ])
      .where('invoice.userID = :userID', { userID: user.id })
      .orderBy('invoice.createdAt', 'DESC');

    // Phân trang
    const paginatedResult = await paginate(page, limit, queryBuilder);

    // Sử dụng hàm paginate để phân trang kết quả
    return paginatedResult;
  }

  async findOne(id: number, user: UserPayload): Promise<Invoice> {
    // Tìm hóa đơn với id
    const invoice = await this.invoiceRepository
      .createQueryBuilder('invoice') // 'invoice' là alias cho bảng Invoice
      .leftJoinAndSelect('invoice.auction', 'auction') // Left join với bảng Auction
      .where('invoice.id = :id', { id })
      .getOne();

    // Nếu không tìm thấy hóa đơn, ném lỗi NotFoundException
    if (!invoice) {
      throw new NotFoundException('Invoice not found.');
    }

    // Kiểm tra nếu user không phải là admin và user.id không trùng với userID trong invoice
    if (user.role !== UserRole.Admin && invoice.userID !== `${user.id}`) {
      throw new ForbiddenException(
        'You do not have permission to view this invoice.',
      );
    }

    return invoice;
  }

  async update(
    id: number,
    updateInvoiceDto: UpdateInvoiceDto,
    user: UserPayload,
  ) {
    // Tìm invoice theo id
    const invoice = await this.invoiceRepository.findOne({ where: { id } });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Kiểm tra quyền truy cập: user phải là người tạo invoice hoặc có role là 'admin'
    if (invoice.userID !== `${user.id}` && user.role !== 'admin') {
      throw new Error('You do not have permission to update this invoice');
    }

    // Cập nhật invoice với dữ liệu mới từ DTO
    const updatedInvoice = Object.assign(invoice, updateInvoiceDto);

    // Lưu lại invoice đã cập nhật
    return this.invoiceRepository.save(updatedInvoice);
  }
  remove(id: number) {
    return `This action removes a #${id} invoice`;
  }
  // Phương thức lấy tất cả các hóa đơn cho admin với phân trang
  async findAllbyAdmin(page: number, limit: number) {
    // Tạo query builder và thực hiện LEFT JOIN với bảng user
    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoin('invoice.auction', 'auction') // Join với bảng auction
      .select([
        'invoice.id', // ID
        'invoice.address', // Địa chỉ
        'invoice.paymentMethod', // Phương thức thanh toán
        'invoice.phoneNumber', // Số điện thoại
        'invoice.userID', // ID người dùng
        'invoice.amount', // Số tiền
        'auction.name', // Tên đấu giá
        'auction.slug', // Tên đấu giá
        'invoice.createdAt',
      ])
      .orderBy('invoice.createdAt', 'DESC'); // Sắp xếp theo ngày tạo

    // Phân trang và lấy dữ liệu
    const paginatedResult = await paginate(page, limit, queryBuilder);
    return paginatedResult;
  }
}
