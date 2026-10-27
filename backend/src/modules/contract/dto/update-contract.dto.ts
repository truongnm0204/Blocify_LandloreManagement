import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsArray,
  IsIn,
  ValidateNested,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ContractTenantItemDto } from './create-contract.dto';

export class UpdateContractDto {
  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2027-05-01' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: '2026-04-15' })
  @IsOptional()
  @IsDateString()
  signedDate?: string;

  @ApiPropertyOptional({ example: 3500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rentAmount?: number;

  @ApiPropertyOptional({ example: 3500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depositAmount?: number;

  @ApiPropertyOptional({ example: 150000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  serviceFee?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  occupantCount?: number;

  @ApiPropertyOptional({ example: 'Updated note' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 5, description: 'Payment due day of month (1-28)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  paymentDay?: number;

  @ApiPropertyOptional({ example: 'MONTHLY', enum: ['MONTHLY', 'QUARTERLY', 'YEARLY'] })
  @IsOptional()
  @IsString()
  @IsIn(['MONTHLY', 'QUARTERLY', 'YEARLY'])
  paymentCycle?: string;

  @ApiPropertyOptional({ type: [ContractTenantItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ContractTenantItemDto)
  tenants?: ContractTenantItemDto[];
}
