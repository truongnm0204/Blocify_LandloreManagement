import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  FeedbackStatus,
  FeedbackCategory,
  FeedbackPriority,
} from '@prisma/client';

export class UpdateFeedbackDto {
  @ApiPropertyOptional({ example: 'Dieu hoa bi hong - cap nhat' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ example: 'Cap nhat mo ta chi tiet hon' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ enum: FeedbackCategory })
  @IsOptional()
  @IsEnum(FeedbackCategory)
  category?: FeedbackCategory;

  @ApiPropertyOptional({ enum: FeedbackPriority })
  @IsOptional()
  @IsEnum(FeedbackPriority)
  priority?: FeedbackPriority;

  @ApiPropertyOptional({ enum: FeedbackStatus })
  @IsOptional()
  @IsEnum(FeedbackStatus)
  status?: FeedbackStatus;

  @ApiPropertyOptional({ example: 'Da thay dieu hoa moi' })
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiPropertyOptional({ example: 'user-cuid' })
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional({ example: 'tenant-cuid' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({ example: 'motel-cuid' })
  @IsOptional()
  @IsString()
  motelId?: string;

  @ApiPropertyOptional({ example: 'room-cuid' })
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
