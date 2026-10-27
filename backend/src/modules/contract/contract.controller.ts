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
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { QueryContractDto } from './dto/query-contract.dto';
import { TerminateContractDto } from './dto/terminate-contract.dto';
import { AddContractTenantDto } from './dto/add-contract-tenant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractController {
  constructor(private contractService: ContractService) {}

  @Get()
  @ApiOperation({ summary: 'List contracts with filters' })
  findAll(@Query() query: QueryContractDto) {
    return this.contractService.findAll(query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Create a draft contract (OWNER/STAFF)' })
  create(
    @Body() dto: CreateContractDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.contractService.create(dto, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract detail with tenants' })
  findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Update draft contract (OWNER/STAFF)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContractDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.contractService.update(id, dto, user.id);
  }

  @Post(':id/activate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a draft contract (OWNER only)' })
  activate(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.contractService.activate(id, user.id);
  }

  @Post(':id/terminate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terminate an active contract (OWNER only)' })
  terminate(
    @Param('id') id: string,
    @Body() dto: TerminateContractDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.contractService.terminate(id, dto, user.id);
  }

  @Post(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a draft contract (OWNER only)' })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.contractService.cancel(id, user.id);
  }

  @Post(':id/tenants')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Add a secondary tenant to an ACTIVE contract (no billing responsibility)' })
  addTenant(
    @Param('id') id: string,
    @Body() dto: AddContractTenantDto,
  ) {
    return this.contractService.addTenant(id, dto.tenantId);
  }

  @Delete(':id/tenants/:tenantId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a secondary tenant from an ACTIVE contract (sets leftAt)' })
  removeTenant(
    @Param('id') id: string,
    @Param('tenantId') tenantId: string,
  ) {
    return this.contractService.removeTenant(id, tenantId);
  }
}
