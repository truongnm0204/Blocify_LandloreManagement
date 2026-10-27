import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { QueryTenantDto } from './dto/query-tenant.dto';
import { TenantStatus, ContractStatus } from '@prisma/client';

// Include active contract info (room + motel) in tenant list for grouping
const ACTIVE_CONTRACT_INCLUDE = {
  contractTenants: {
    where: { contract: { status: ContractStatus.ACTIVE } },
    take: 1,
    include: {
      contract: {
        select: {
          id: true,
          contractCode: true,
          status: true,
          room: {
            select: {
              id: true,
              roomCode: true,
              roomName: true,
              motel: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  },
};

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTenantDto) {
    const { search, status, motelId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { citizenId: { contains: search } },
      ];
    }

    // Filter by motel: find tenants who have active contract in rooms of this motel
    if (motelId) {
      where.contractTenants = {
        some: {
          contract: {
            status: ContractStatus.ACTIVE,
            room: { motelId },
          },
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: ACTIVE_CONTRACT_INCLUDE,
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        contractTenants: {
          include: {
            contract: {
              select: {
                id: true,
                contractCode: true,
                status: true,
                startDate: true,
                endDate: true,
                room: {
                  select: {
                    id: true,
                    roomCode: true,
                    roomName: true,
                    motel: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async create(dto: CreateTenantDto) {
    // Validate citizenId uniqueness
    if (dto.citizenId) {
      const existing = await this.prisma.tenant.findUnique({
        where: { citizenId: dto.citizenId },
      });
      if (existing) {
        throw new ConflictException('Citizen ID (CCCD) already exists');
      }
    }

    return this.prisma.tenant.create({
      data: {
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        citizenId: dto.citizenId,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
        permanentAddress: dto.permanentAddress,
        vehicleNumber: dto.vehicleNumber,
        note: dto.note,
      },
    });
  }

  async update(id: string, dto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Cannot deactivate/blacklist tenant with active contract
    if (
      dto.status &&
      dto.status !== TenantStatus.ACTIVE &&
      tenant.status === TenantStatus.ACTIVE
    ) {
      const activeContract = await this.prisma.contractTenant.findFirst({
        where: {
          tenantId: id,
          contract: { status: ContractStatus.ACTIVE },
        },
      });
      if (activeContract) {
        throw new BadRequestException(
          'Cannot change status while tenant has an active contract',
        );
      }
    }

    // Validate citizenId uniqueness on update
    if (dto.citizenId && dto.citizenId !== tenant.citizenId) {
      const existing = await this.prisma.tenant.findUnique({
        where: { citizenId: dto.citizenId },
      });
      if (existing) {
        throw new ConflictException('Citizen ID (CCCD) already exists');
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
        ...(dto.phoneNumber !== undefined
          ? { phoneNumber: dto.phoneNumber }
          : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.citizenId !== undefined ? { citizenId: dto.citizenId } : {}),
        ...(dto.dateOfBirth !== undefined
          ? { dateOfBirth: new Date(dto.dateOfBirth) }
          : {}),
        ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
        ...(dto.permanentAddress !== undefined
          ? { permanentAddress: dto.permanentAddress }
          : {}),
        ...(dto.vehicleNumber !== undefined
          ? { vehicleNumber: dto.vehicleNumber }
          : {}),
        ...(dto.note !== undefined ? { note: dto.note } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });
  }
}
