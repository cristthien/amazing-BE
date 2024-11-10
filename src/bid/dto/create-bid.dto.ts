import { IsInt, IsPositive, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBidDto {
  @IsInt()
  @IsPositive()
  auctionId: number;

  @IsInt()
  @IsPositive()
  userId: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
