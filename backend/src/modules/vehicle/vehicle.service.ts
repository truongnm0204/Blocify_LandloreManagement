import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { VehicleStatus, ContractStatus } from '@prisma/client';

const TENANT_INCLUDE = {
  select: {
    id: true,
    fullName: true,
    phoneNumber: true,
    contractTenants: {
      where: { contract: { status: ContractStatus.ACTIVE } },
      include: {
        contract: {
          select: {
            id: true,
            contractCode: true,
            status: true,
            // Include motel directly on contract for grouping in vehicle list
            motel: { select: { id: true, name: true } },
            room: {
              select: {
                id: true,
                roomCode: true,
                roomName: true,
              },
            },
          },
        },
      },
    },
  },
};

function mapVehicle(v: Record<string, unknown>) {
  return {
    ...v,
    monthlyFee: v.monthlyFee != null ? parseFloat(String(v.monthlyFee)) : null,
  };
}

@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryVehicleDto) {
    const { search, vehicleType, status, tenantId, motelId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      status: status ?? VehicleStatus.ACTIVE,
    };

    if (vehicleType) where.vehicleType = vehicleType;
    if (tenantId) where.tenantId = tenantId;

    if (search) {
      where.OR = [
        { licensePlate: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (motelId) {
      const tenantIds = await this.getTenantIdsByMotel(motelId);
      // Match vehicles by direct motelId OR by tenant's active contract motel
      // Use AND to avoid conflicting with search OR
      const motelFilter = { OR: [{ motelId }, { tenantId: { in: tenantIds } }] };
      where.AND = [...(Array.isArray(where.AND) ? where.AND : []), motelFilter];
    }

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          tenant: TENANT_INCLUDE,
          motel: { select: { id: true, name: true } },
        },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      data: data.map(mapVehicle),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        tenant: TENANT_INCLUDE,
        motel: { select: { id: true, name: true } },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return mapVehicle(vehicle as unknown as Record<string, unknown>);
  }

  async create(dto: CreateVehicleDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const duplicate = await this.prisma.vehicle.findUnique({
      where: { tenantId_licensePlate: { tenantId: dto.tenantId, licensePlate: dto.licensePlate } },
    });
    if (duplicate) {
      throw new ConflictException('This tenant already has a vehicle with this license plate');
    }

    const vehicle = await this.prisma.vehicle.create({
      data: {
        tenantId: dto.tenantId,
        motelId: dto.motelId ?? null,
        licensePlate: dto.licensePlate,
        vehicleType: dto.vehicleType,
        brand: dto.brand,
        color: dto.color,
        monthlyFee: dto.monthlyFee != null ? dto.monthlyFee : undefined,
        description: dto.description,
        images: dto.images ?? [],
      },
      include: {
        tenant: TENANT_INCLUDE,
        motel: { select: { id: true, name: true } },
      },
    });

    return mapVehicle(vehicle as unknown as Record<string, unknown>);
  }

  async update(id: string, dto: UpdateVehicleDto) {
    const existing = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Vehicle not found');
    }

    const newTenantId = dto.tenantId ?? existing.tenantId;
    const newLicensePlate = dto.licensePlate ?? existing.licensePlate;

    if (dto.tenantId !== undefined || dto.licensePlate !== undefined) {
      const duplicate = await this.prisma.vehicle.findUnique({
        where: { tenantId_licensePlate: { tenantId: newTenantId, licensePlate: newLicensePlate } },
      });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('This tenant already has a vehicle with this license plate');
      }
    }

    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(dto.tenantId !== undefined ? { tenantId: dto.tenantId } : {}),
        ...(dto.motelId !== undefined ? { motelId: dto.motelId || null } : {}),
        ...(dto.licensePlate !== undefined ? { licensePlate: dto.licensePlate } : {}),
        ...(dto.vehicleType !== undefined ? { vehicleType: dto.vehicleType } : {}),
        ...(dto.brand !== undefined ? { brand: dto.brand } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.monthlyFee !== undefined ? { monthlyFee: dto.monthlyFee } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.images !== undefined ? { images: dto.images } : {}),
      },
      include: {
        tenant: TENANT_INCLUDE,
        motel: { select: { id: true, name: true } },
      },
    });

    return mapVehicle(vehicle as unknown as Record<string, unknown>);
  }

  private async getTenantIdsByMotel(motelId: string): Promise<string[]> {
    const contractTenants = await this.prisma.contractTenant.findMany({
      where: {
        contract: { motelId, status: ContractStatus.ACTIVE },
      },
      select: { tenantId: true },
    });
    return [...new Set(contractTenants.map((ct) => ct.tenantId))];
  }
}
