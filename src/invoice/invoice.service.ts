import { Auction } from '@/src/auctions/entities/auction.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}
  create(userID: string, auction: Auction) {
    const invoice = this.invoiceRepository.create({
      userID,
      auction,
      amount: Number(auction.highest_bid), // Assuming 'amount' is based on auction's price
      status: 'pending', // Default status for a new invoice
      createdAt: new Date(),
    });
    return this.invoiceRepository.save(invoice);
  }

  findAll() {
    return `This action returns all invoice`;
  }

  findOne(id: number) {
    return `This action returns a #${id} invoice`;
  }

  // update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
  //   return `This action updates a #${id} invoice`;
  // }

  remove(id: number) {
    return `This action removes a #${id} invoice`;
  }
}
