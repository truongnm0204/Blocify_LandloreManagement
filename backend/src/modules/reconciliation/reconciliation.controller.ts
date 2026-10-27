import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReconciliationService } from './reconciliation.service';
import { ReconcileBatchDto } from './dto/reconcile-batch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('reconciliation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reconciliation')
export class ReconciliationController {
  constructor(private reconciliationService: ReconciliationService) {}

  @Post('batch')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Process batch reconciliation from AI-parsed bank statement' })
  reconcileBatch(
    @Body() dto: ReconcileBatchDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.reconciliationService.reconcileBatch(dto, user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get AI reconciliation history' })
  getHistory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reconciliationService.getHistory(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
