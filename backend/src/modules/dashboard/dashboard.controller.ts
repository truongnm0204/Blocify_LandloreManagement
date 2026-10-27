import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard overview statistics' })
  @ApiQuery({ name: 'motelId', required: false, description: 'Filter by motel ID' })
  getOverview(@Query('motelId') motelId?: string) {
    return this.dashboardService.getOverview(motelId);
  }

  @Get('revenue-trend')
  @ApiOperation({ summary: 'Get revenue trend by month' })
  @ApiQuery({ name: 'months', required: false, description: 'Number of months (default 6)' })
  @ApiQuery({ name: 'motelId', required: false, description: 'Filter by motel ID' })
  getRevenueTrend(
    @Query('months') months?: string,
    @Query('motelId') motelId?: string,
  ) {
    return this.dashboardService.getRevenueByMonth(
      months ? parseInt(months, 10) : 6,
      motelId,
    );
  }

  @Get('expense-breakdown')
  @ApiOperation({ summary: 'Get expense breakdown by category' })
  @ApiQuery({ name: 'motelId', required: false, description: 'Filter by motel ID' })
  getExpenseBreakdown(@Query('motelId') motelId?: string) {
    return this.dashboardService.getExpenseBreakdown(motelId);
  }

  @Get('motel-occupancy')
  @ApiOperation({ summary: 'Get occupancy rates for all motels' })
  getMotelOccupancy() {
    return this.dashboardService.getMotelOccupancy();
  }

  @Get('recent-transactions')
  @ApiOperation({ summary: 'Get recent payment transactions' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of transactions (default 10)' })
  @ApiQuery({ name: 'motelId', required: false, description: 'Filter by motel ID' })
  getRecentTransactions(
    @Query('limit') limit?: string,
    @Query('motelId') motelId?: string,
  ) {
    return this.dashboardService.getRecentTransactions(
      limit ? parseInt(limit, 10) : 10,
      motelId,
    );
  }
}
