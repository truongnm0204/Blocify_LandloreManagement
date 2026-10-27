import { IsNumber, IsOptional, IsDateString, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ example: 50000, description: 'Surcharge amount (VND)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  surchargeAmount?: number;

  @ApiPropertyOptional({ example: 0, description: 'Discount amount (VND)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ example: '2026-04-05' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'Cap nhat ghi chu' })
  @IsOptional()
  @IsString()
  note?: string;
}
