import { PaymentMethod } from './../../common/enums/index';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional() // Thêm @IsOptional() để có thể bỏ qua trường này khi không cần cập nhật
  @IsEnum(PaymentMethod, {
    message: 'Payment method must be one of cash, momo, or bank',
  })
  @Transform(({ value }) => value || PaymentMethod.CASH) // Nếu không có giá trị, mặc định là 'CASH'
  paymentMethod: PaymentMethod;
}
