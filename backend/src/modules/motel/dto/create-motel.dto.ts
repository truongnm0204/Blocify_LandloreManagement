import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMotelDto {
  @ApiProperty({ example: 'Khu trọ An Phú' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123 Đường ABC, Quận 1, TP.HCM' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: 'Khu trọ yên tĩnh, an ninh tốt' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 3500, description: 'Electricity price per kWh (VND)' })
  @IsNumber()
  @Min(0)
  defaultElectricityPrice: number;

  @ApiProperty({ example: 15000, description: 'Water price per m3 (VND)' })
  @IsNumber()
  @Min(0)
  defaultWaterPrice: number;

  @ApiPropertyOptional({ example: 50000, description: 'Monthly service fee (VND)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultServiceFee?: number;

  @ApiPropertyOptional({ example: 5, description: 'Day of month payment is due (1-31)' })
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
}
