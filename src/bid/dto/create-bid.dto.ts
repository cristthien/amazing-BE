import { IsInt, IsPositive, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBidDto {
  @IsInt()
  @IsPositive()
  auctionSlug: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
