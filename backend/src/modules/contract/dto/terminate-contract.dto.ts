import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TerminateContractDto {
  @ApiProperty({ example: '2026-06-30' })
  @IsDateString()
  terminationDate: string;

  @ApiPropertyOptional({ example: 'Nguoi thue chuyen di' })
  @IsOptional()
  @IsString()
  terminationReason?: string;
}
