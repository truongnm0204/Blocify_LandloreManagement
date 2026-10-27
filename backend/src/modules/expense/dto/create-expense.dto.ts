import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseCategory } from '@prisma/client';

export class CreateExpenseDto {
  @ApiProperty({ example: 'clxxxxxx', description: 'Motel ID' })
  @IsString()
  @IsNotEmpty()
  motelId: string;

  @ApiProperty({ enum: ExpenseCategory, example: ExpenseCategory.MAINTENANCE })
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @ApiProperty({ example: 500000, description: 'Expense amount (VND)' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'Sua chua may bom nuoc' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'Da thanh toan tien mat' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: '2025-01-15', description: 'Expense date (ISO date)' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: ['/upload/receipt1.jpg'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
