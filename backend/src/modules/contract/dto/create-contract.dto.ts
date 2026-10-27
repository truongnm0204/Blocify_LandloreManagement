import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsIn,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ContractTenantItemDto {
  @ApiProperty({ example: 'tenant-cuid' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isRepresentative: boolean;
}

export class CreateContractDto {
  @ApiProperty({ example: 'room-cuid' })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ example: '2026-04-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2027-04-01' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @IsDateString()
  signedDate?: string;

  @ApiProperty({ example: 3000000, description: 'Monthly rent (VND)' })
  @IsNumber()
  @Min(0)
  rentAmount: number;

  @ApiProperty({ example: 3000000, description: 'Deposit (VND)' })
  @IsNumber()
  @Min(0)
  depositAmount: number;

  @ApiPropertyOptional({ example: 100000, description: 'Service fee (VND/month)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  serviceFee?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  occupantCount?: number;

  @ApiPropertyOptional({ example: 'Ghi chu hop dong' })
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

  @ApiProperty({ type: [ContractTenantItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ContractTenantItemDto)
  tenants: ContractTenantItemDto[];
}
