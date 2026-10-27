import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackCategory, FeedbackPriority } from '@prisma/client';

export class CreateFeedbackDto {
  @ApiProperty({ example: 'Dieu hoa bi hong' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Dieu hoa phong 101 khong lanh, can ky thuat vien kiem tra' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: FeedbackCategory, example: 'MAINTENANCE' })
  @IsEnum(FeedbackCategory)
  category: FeedbackCategory;

  @ApiPropertyOptional({ enum: FeedbackPriority, example: 'MEDIUM', default: 'MEDIUM' })
  @IsOptional()
  @IsEnum(FeedbackPriority)
  priority?: FeedbackPriority;

  @ApiProperty({ example: 'tenant-cuid' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ example: 'motel-cuid' })
  @IsString()
  @IsNotEmpty()
  motelId: string;

  @ApiPropertyOptional({ example: 'room-cuid' })
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiPropertyOptional({ type: [String], example: ['https://example.com/image1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
