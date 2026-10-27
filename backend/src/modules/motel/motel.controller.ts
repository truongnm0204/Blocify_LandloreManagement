import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MotelService } from './motel.service';
import { CreateMotelDto } from './dto/create-motel.dto';
import { UpdateMotelDto } from './dto/update-motel.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('motels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('motels')
export class MotelController {
  constructor(private motelService: MotelService) {}

  @Get()
  @ApiOperation({ summary: "List current owner's motels" })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: { id: string },
  ) {
    return this.motelService.findAll(
      user!.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Create a new motel (OWNER only)' })
  create(
    @Body() dto: CreateMotelDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.motelService.create(dto, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get motel by ID' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.motelService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update motel (OWNER only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMotelDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.motelService.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete motel (OWNER only)' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.motelService.remove(id, user.id);
  }
}
