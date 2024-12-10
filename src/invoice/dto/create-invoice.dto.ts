// src/invoice/dto/create-invoice.dto.ts
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  auctionSlug: string;
}
