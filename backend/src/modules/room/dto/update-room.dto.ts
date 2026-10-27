import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoomStatus } from '@prisma/client';

export class UpdateRoomDto {
  @ApiPropertyOptional({ example: 'P101-Updated' })
  @IsOptional()
  @IsString()
  roomCode?: string;

  @ApiPropertyOptional({ example: 'Phong 101 moi' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 3200000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseRent?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  floor?: number;

  @ApiPropertyOptional({ example: 28.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  area?: number;

  @ApiPropertyOptional({ example: 2500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depositSuggested?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxOccupants?: number;

  @ApiPropertyOptional({ example: 'Da sua chua lai' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: RoomStatus })
  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;
}
