import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class ReconcileItemDto {
  @ApiProperty({ example: 'invoice-cuid', description: 'Matched invoice ID' })
  @IsString()
  @IsNotEmpty()
  invoiceId: string;

  @ApiProperty({ example: 2500000, description: 'Payment amount (VND)' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: '2026-03-21' })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({ enum: PaymentMethod, example: 'BANK_TRANSFER' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'NGUYEN VAN A CK TIEN PHONG 201 T3/2026' })
  @IsOptional()
  @IsString()
  rawText?: string;

  @ApiPropertyOptional({ example: 'TXN-12345' })
  @IsOptional()
  @IsString()
  referenceNumber?: string;
}

export class ReconcileBatchDto {
  @ApiProperty({ type: [ReconcileItemDto], description: 'List of reconciled payments' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReconcileItemDto)
  items: ReconcileItemDto[];
}
