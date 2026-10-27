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
@Controller('motels/:motelId/rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get()
  @ApiOperation({ summary: 'List rooms in a motel, optionally filtered by status' })
  findAll(
    @Param('motelId') motelId: string,
    @Query() query: QueryRoomDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.roomService.findAll(motelId, user.id, query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Create a room in a motel (OWNER/STAFF)' })
  create(
    @Param('motelId') motelId: string,
    @Body() dto: CreateRoomDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.roomService.create(motelId, dto, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room detail' })
  findOne(
    @Param('motelId') motelId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.roomService.findOne(motelId, id, user.id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Update a room (OWNER/STAFF)' })
  update(
    @Param('motelId') motelId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.roomService.update(motelId, id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a room (OWNER only, no contract history)' })
  remove(
    @Param('motelId') motelId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.roomService.remove(motelId, id, user.id);
  }
}
