import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvoiceDto {
  @ApiProperty({ example: 'contract-cuid' })
  @IsString()
  @IsNotEmpty()
  contractId: string;

  @ApiProperty({ example: 3, description: 'Invoice month (1-12)' })
  @IsNumber()
  @Min(1)
  @Max(12)
  invoiceMonth: number;

  @ApiProperty({ example: 2026, description: 'Invoice year' })
  @IsNumber()
  @Min(2020)
  invoiceYear: number;

  @ApiPropertyOptional({ example: '2026-03-21', description: 'Billing date. Defaults to now' })
  @IsOptional()
  @IsDateString()
  billingDate?: string;

  @ApiPropertyOptional({ example: '2026-04-05', description: 'Payment due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

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

  @ApiPropertyOptional({ example: 'Hoa don thang 3' })
  @IsOptional()
  @IsString()
  note?: string;
}
