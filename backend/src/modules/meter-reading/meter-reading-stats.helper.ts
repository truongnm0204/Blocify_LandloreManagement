import { PrismaService } from '../../../prisma/prisma.service';
import { QueryMeterReadingStatsDto } from './dto/query-meter-reading-stats.dto';

function buildGrowthMonths(): { month: number; year: number; label: string }[] {
  const result: { month: number; year: number; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    });
  }
  return result;
}

export async function getMeterReadingStats(
  prisma: PrismaService,
  query: QueryMeterReadingStatsDto,
) {
  const { motelId, readingMonth, readingYear } = query;

  const where: Record<string, unknown> = {};
  if (motelId) where.motelId = motelId;
  if (readingMonth) where.readingMonth = readingMonth;
  if (readingYear) where.readingYear = readingYear;

  const months = buildGrowthMonths();
  const growthWhere = {
    ...(motelId ? { motelId } : {}),
    OR: months.map((m) => ({ readingMonth: m.month, readingYear: m.year })),
  };

  const [aggregate, totalRooms, recorded, locked, growthRaw] = await Promise.all([
    prisma.meterReading.aggregate({
      where,
      _sum: {
        electricityUsage: true,
        waterUsage: true,
        electricityPrevious: true,
        electricityCurrent: true,
        waterPrevious: true,
        waterCurrent: true,
      },
    }),
    // Total rooms in scope
    prisma.room.count({ where: motelId ? { motelId } : undefined }),
    // Rooms with a reading in this period
    prisma.meterReading.count({ where }),
    // Locked readings in this period
    prisma.meterReading.count({ where: { ...where, isLocked: true } }),
    // Growth: groupBy month/year for last 6 months
    prisma.meterReading.groupBy({
      by: ['readingMonth', 'readingYear'],
      where: growthWhere,
      _sum: { electricityUsage: true, waterUsage: true },
    }),
  ]);

  const sum = aggregate._sum;
  const totalElectricity = parseFloat(String(sum.electricityUsage ?? 0));
  const totalWater = parseFloat(String(sum.waterUsage ?? 0));
  const totalElectricityOld = parseFloat(String(sum.electricityPrevious ?? 0));
  const totalElectricityNew = parseFloat(String(sum.electricityCurrent ?? 0));
  const totalWaterOld = parseFloat(String(sum.waterPrevious ?? 0));
  const totalWaterNew = parseFloat(String(sum.waterCurrent ?? 0));

  // estimatedRevenue requires per-row prices; use a raw aggregate via findMany+reduce
  // For performance we use a second aggregate trick: SUM(usage * unitPrice) isn't
  // directly available in Prisma aggregate, so we fetch minimal fields.
  const revenueRows = await prisma.meterReading.findMany({
    where,
    select: { electricityUsage: true, electricityUnitPrice: true, waterUsage: true, waterUnitPrice: true },
  });
  const estimatedRevenue = revenueRows.reduce((acc, r) => {
    return (
      acc +
      parseFloat(String(r.electricityUsage)) * parseFloat(String(r.electricityUnitPrice)) +
      parseFloat(String(r.waterUsage)) * parseFloat(String(r.waterUnitPrice))
    );
  }, 0);

  // Build growth array aligned to last 6 months
  const growthMap = new Map(
    growthRaw.map((g) => [
      `${g.readingYear}-${String(g.readingMonth).padStart(2, '0')}`,
      {
        electricity: parseFloat(String(g._sum.electricityUsage ?? 0)),
        water: parseFloat(String(g._sum.waterUsage ?? 0)),
      },
    ]),
  );
  const growth = months.map((m) => ({
    month: m.label,
    electricity: growthMap.get(m.label)?.electricity ?? 0,
    water: growthMap.get(m.label)?.water ?? 0,
  }));

  return {
    estimatedRevenue,
    totalElectricity,
    totalWater,
    totalElectricityOld,
    totalElectricityNew,
    totalWaterOld,
    totalWaterNew,
    progress: {
      totalRooms,
      recorded,
      locked,
      unlocked: recorded - locked,
    },
    growth,
  };
}
