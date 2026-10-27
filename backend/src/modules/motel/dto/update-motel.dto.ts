import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMotelDto {
  @ApiPropertyOptional({ example: 'Khu trọ An Phú 2' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '456 Đường XYZ, Quận 2, TP.HCM' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 3800 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultElectricityPrice?: number;

  @ApiPropertyOptional({ example: 18000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultWaterPrice?: number;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultServiceFee?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  paymentDueDay?: number;

  @ApiPropertyOptional({ example: ['https://...'], description: 'Array of image URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Enable auto invoice generation' })
  @IsOptional()
  @IsBoolean()
  autoInvoice?: boolean;
}
