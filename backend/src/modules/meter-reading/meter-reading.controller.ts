import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MeterReadingService } from './meter-reading.service';
import { CreateMeterReadingDto } from './dto/create-meter-reading.dto';
import { UpdateMeterReadingDto } from './dto/update-meter-reading.dto';
import { QueryMeterReadingDto } from './dto/query-meter-reading.dto';
import { QueryMeterReadingStatsDto } from './dto/query-meter-reading-stats.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('meter-readings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meter-readings')
export class MeterReadingController {
  constructor(private meterReadingService: MeterReadingService) {}

  @Get()
  @ApiOperation({ summary: 'List meter readings with filters' })
  findAll(@Query() query: QueryMeterReadingDto) {
    return this.meterReadingService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get meter reading statistics (totals, progress, growth)' })
  getStats(@Query() query: QueryMeterReadingStatsDto) {
    return this.meterReadingService.getStats(query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Create a meter reading (OWNER/STAFF)' })
  create(
    @Body() dto: CreateMeterReadingDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.meterReadingService.create(dto, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meter reading detail' })
  findOne(@Param('id') id: string) {
    return this.meterReadingService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Update meter reading if not locked (OWNER/STAFF)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMeterReadingDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.meterReadingService.update(id, dto, user.id);
  }

  @Post(':id/lock')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lock a meter reading (OWNER/STAFF)' })
  lock(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.meterReadingService.lock(id, user.id);
  }
}
