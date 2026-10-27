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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class FlatRoomController {
  constructor(private roomService: RoomService) {}

  @Get()
  @ApiOperation({ summary: 'List rooms with optional motelId filter' })
  findAll(@Query() query: QueryRoomDto) {
    return this.roomService.findAllFlat(query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Create a room (motelId in body)' })
  create(
    @Body() dto: CreateRoomDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.roomService.createFlat(dto, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room detail by ID' })
  findOne(@Param('id') id: string) {
    return this.roomService.findOneById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Update room by ID' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.roomService.updateById(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Delete room by ID (OWNER only)' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.roomService.removeById(id, user.id);
  }
}
