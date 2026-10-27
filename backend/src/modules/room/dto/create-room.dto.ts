import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiPropertyOptional({ example: 'motel-cuid', description: 'Motel ID (required for flat /rooms route)' })
  @IsOptional()
  @IsString()
  motelId?: string;

  @ApiProperty({ example: 'P101' })
  @IsString()
  @IsNotEmpty()
  roomCode: string;

  @ApiProperty({ example: 'Phong 101' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 3000000, description: 'Base rent price (VND/month)' })
  @IsNumber()
  @Min(0)
  baseRent: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  floor?: number;

  @ApiPropertyOptional({ example: 25.5, description: 'Room area in m2' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  area?: number;

  @ApiPropertyOptional({ example: 2000000, description: 'Suggested deposit (VND)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depositSuggested?: number;

  @ApiPropertyOptional({ example: 2, description: 'Max number of occupants' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxOccupants?: number;

  @ApiPropertyOptional({ example: 'Phong huong Dong, co ban cong' })
  @IsOptional()
  @IsString()
  notes?: string;
}
