import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryMeterReadingStatsDto {
  @ApiPropertyOptional({ description: 'Filter by motel ID' })
  @IsOptional()
  @IsString()
  motelId?: string;

  @ApiPropertyOptional({ description: 'Filter by month (1-12)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readingMonth?: number;

  @ApiPropertyOptional({ description: 'Filter by year' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readingYear?: number;
}
