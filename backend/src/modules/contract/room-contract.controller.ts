import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ContractService } from './contract.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomContractController {
  constructor(private contractService: ContractService) {}

  @Get(':roomId/active-contract')
  @ApiOperation({ summary: 'Get active contract of a room' })
  findActiveByRoom(@Param('roomId') roomId: string) {
    return this.contractService.findActiveByRoom(roomId);
  }
}
