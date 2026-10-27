import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType } from '@prisma/client';

export class CreateVehicleDto {
  @ApiProperty({ example: 'clxxxxxx' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiPropertyOptional({ example: 'clxxxxxx', description: 'Motel/building the vehicle belongs to' })
  @IsOptional()
  @IsString()
  motelId?: string;

  @ApiProperty({ example: '51A-12345' })
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @ApiProperty({ enum: VehicleType, example: VehicleType.MOTORCYCLE })
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @ApiPropertyOptional({ example: 'Honda' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'Red' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 100000, description: 'Monthly parking fee' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyFee?: number;

  @ApiPropertyOptional({ example: 'Xe may di lam' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['/upload/vehicle1.jpg'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
