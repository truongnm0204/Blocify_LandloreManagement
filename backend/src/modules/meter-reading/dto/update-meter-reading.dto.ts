import { IsNumber, IsOptional, IsDateString, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMeterReadingDto {
  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  electricityPrevious?: number;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  electricityCurrent?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  waterPrevious?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  waterCurrent?: number;

  @ApiPropertyOptional({ example: 3500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  electricityUnitPrice?: number;

  @ApiPropertyOptional({ example: 15000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  waterUnitPrice?: number;

  @ApiPropertyOptional({ example: '2026-03-21' })
  @IsOptional()
  @IsDateString()
  recordedDate?: string;

  @ApiPropertyOptional({ example: 'Ghi chu cap nhat' })
  @IsOptional()
  @IsString()
  note?: string;
}
