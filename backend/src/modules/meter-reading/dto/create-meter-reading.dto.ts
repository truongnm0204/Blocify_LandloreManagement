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

export class CreateMeterReadingDto {
  @ApiProperty({ example: 'room-cuid' })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ example: 3, description: 'Month (1-12)' })
  @IsNumber()
  @Min(1)
  @Max(12)
  readingMonth: number;

  @ApiProperty({ example: 2026, description: 'Year' })
  @IsNumber()
  @Min(2020)
  readingYear: number;

  @ApiProperty({ example: 100, description: 'Previous electricity reading' })
  @IsNumber()
  @Min(0)
  electricityPrevious: number;

  @ApiProperty({ example: 150, description: 'Current electricity reading' })
  @IsNumber()
  @Min(0)
  electricityCurrent: number;

  @ApiProperty({ example: 10, description: 'Previous water reading' })
  @IsNumber()
  @Min(0)
  waterPrevious: number;

  @ApiProperty({ example: 15, description: 'Current water reading' })
  @IsNumber()
  @Min(0)
  waterCurrent: number;

  @ApiPropertyOptional({ example: 3500, description: 'Electricity unit price (VND/kWh). Auto-filled from motel default if omitted' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  electricityUnitPrice?: number;

  @ApiPropertyOptional({ example: 15000, description: 'Water unit price (VND/m3). Auto-filled from motel default if omitted' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  waterUnitPrice?: number;

  @ApiPropertyOptional({ example: '2026-03-21' })
  @IsOptional()
  @IsDateString()
  recordedDate?: string;

  @ApiPropertyOptional({ example: 'Ghi chu' })
  @IsOptional()
  @IsString()
  note?: string;
}
