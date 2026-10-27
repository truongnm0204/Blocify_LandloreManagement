import "dotenv/config";
import {
  PrismaClient,
  UserRole,
  UserStatus,
  MotelStatus,
  RoomStatus,
  TenantStatus,
  ContractStatus,
  InvoiceStatus,
  InvoiceItemType,
  PaymentMethod,
  VehicleType,
  VehicleStatus,
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { MOTEL_CONFIGS, PROVINCES } from "./seed-data/address-pools";
import { FEEDBACK_TEMPLATES, RESOLUTION_TEMPLATES } from "./seed-data/feedback-templates";
import {
  setSeed, seededRandom, randomInt, randomPick, shuffled,
  generateFullName, resetNameTracker, generatePhone, generateCitizenId,
  generateLicensePlate, generateVehicleForTenant, generatePermanentAddress,
  generateElecUsage, generateWaterUsage, roundRent,
} from "./seed-data/generators";
import { PARKING_FEES } from "./seed-data/vehicle-pools";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// --- Image download helper ---
const UPLOADS_DIR = join(process.cwd(), "uploads");

async function downloadImage(url: string, filename: string): Promise<string> {
  if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });
  const filePath = join(UPLOADS_DIR, filename);
  if (existsSync(filePath)) return `/upload/${filename}`;

  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(filePath, buffer);
    console.log(`  Downloaded: ${filename}`);
  } catch (err) {
    console.warn(`  Failed to download ${filename}: ${err}`);
    const placeholder = Buffer.from(
      "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsK" +
      "CwsM EA4QDQ4NDAwMEBMRERMUFBQWFxcXGBkZHR0dHRn/2wBDAQMEBAUEBQkFBQkdDwsPHR0dHR0d" +
      "HR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAABAAEDASIA" +
      "AhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAB//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAA" +
      "AAAAAAAAAAAAAAAAB//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ALwAA//Z",
      "base64"
    );
    writeFileSync(filePath, placeholder);
  }
  return `/upload/${filename}`;
}

// --- Tracking arrays for cross-referencing ---
interface RoomRecord {
  id: string; motelId: string; roomCode: string; roomName: string;
  floor: number; area: number; baseRentPrice: number; maxOccupants: number;
  status: RoomStatus; motelIndex: number;
}
interface TenantRecord {
  id: string; fullName: string; phoneNumber: string; citizenId: string;
  gender: string; permanentAddress: string; status: TenantStatus; note: string | null;
}
interface ContractRecord {
  id: string; code: string; motelId: string; roomId: string;
  repTenantId: string; occupants: number; rent: number; deposit: number;
  serviceFee: number; start: string; end: string; status: ContractStatus;
  members: { tenantId: string; isRep: boolean }[];
  motelIndex: number;
}
interface VehicleRecord {
  id: string; tenantId: string; plate: string; type: VehicleType;
  brand: string; color: string; fee: number; desc: string; images: string[];
}
interface MeterRecord {
  id: string; motelId: string; roomId: string; contractId: string;
  month: number; year: number;
  elecPrev: number; elecCurr: number; elecPrice: number;
  waterPrev: number; waterCurr: number; waterPrice: number;
  locked: boolean;
}

const allRooms: RoomRecord[] = [];
const allTenants: TenantRecord[] = [];
const allContracts: ContractRecord[] = [];
const allVehicles: VehicleRecord[] = [];
const allMeters: MeterRecord[] = [];

async function main() {
  console.log("Seeding database (200+ tenants scale)...\n");
  setSeed(42);
  resetNameTracker();

  // ────────────────────────────────────────────
  // CLEAN
  // ────────────────────────────────────────────
  console.log("Cleaning existing data...");
  await prisma.feedback.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.meterReading.deleteMany();
  await prisma.contractTenant.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.room.deleteMany();
  await prisma.motel.deleteMany();
  await prisma.user.deleteMany();
  console.log("Clean complete.\n");

  // ────────────────────────────────────────────
  // IMAGES
  // ────────────────────────────────────────────
  console.log("Downloading seed images...");
  const motelImageSets: string[][] = [];
  for (let mi = 0; mi < MOTEL_CONFIGS.length; mi++) {
    const imgs: string[] = [];
    const count = mi < 3 ? 3 : 2; // first 3 motels get 3 images, rest 2
    for (let j = 0; j < count; j++) {
      const url = `https://picsum.photos/seed/motel${mi}${String.fromCharCode(97 + j)}/800/600`;
      const fname = `motel-${MOTEL_CONFIGS[mi].roomPrefix.toLowerCase()}-${j + 1}.jpg`;
      imgs.push(await downloadImage(url, fname));
    }
    motelImageSets.push(imgs);
  }
  // Vehicle images pool (20 images, reused cyclically)
  const vehicleImgPool: string[] = [];
  for (let vi = 0; vi < 20; vi++) {
    const fname = `vehicle-${String(vi + 1).padStart(2, "0")}.jpg`;
    vehicleImgPool.push(
      await downloadImage(`https://picsum.photos/seed/v${String(vi + 1).padStart(2, "0")}/600/400`, fname)
    );
  }
  console.log("Images done.\n");

  const passwordHash = await bcrypt.hash("123456", 10);

  // ────────────────────────────────────────────
  // USERS (4: 1 owner + 3 staff)
  // ────────────────────────────────────────────
  const owner = await prisma.user.create({
    data: { id: "u-owner", email: "owner@example.com", passwordHash, fullName: "Nguyen Van An", phoneNumber: "0900000001", role: UserRole.OWNER, status: UserStatus.ACTIVE },
  });
  const staffList: Awaited<ReturnType<typeof prisma.user.create>>[] = [];
  const staffDefs = [
    { id: "u-staff1", email: "staff1@example.com", name: "Tran Thi Bich", phone: "0900000002" },
    { id: "u-staff2", email: "staff2@example.com", name: "Le Van Cuong", phone: "0900000003" },
    { id: "u-staff3", email: "staff3@example.com", name: "Pham Thi Dung", phone: "0900000004" },
  ];
  for (const s of staffDefs) {
    const st = await prisma.user.create({
      data: { id: s.id, email: s.email, passwordHash, fullName: s.name, phoneNumber: s.phone, role: UserRole.STAFF, status: UserStatus.ACTIVE },
    });
    staffList.push(st);
  }
  console.log("Users: 4 (1 owner + 3 staff)");

  // ────────────────────────────────────────────
  // MOTELS (10)
  // ────────────────────────────────────────────
  const motelIds: string[] = [];
  for (let mi = 0; mi < MOTEL_CONFIGS.length; mi++) {
    const cfg = MOTEL_CONFIGS[mi];
    const motelId = `m-${mi + 1}`;
    await prisma.motel.create({
      data: {
        id: motelId, name: cfg.name, address: cfg.address, description: cfg.description,
        defaultElectricityPrice: cfg.elecPrice, defaultWaterPrice: cfg.waterPrice,
        defaultServiceFee: cfg.serviceFee, paymentDueDay: cfg.paymentDueDay,
        images: motelImageSets[mi], status: MotelStatus.ACTIVE, ownerId: owner.id,
      },
    });
    motelIds.push(motelId);
  }
  console.log(`Motels: ${motelIds.length}`);

  // ────────────────────────────────────────────
  // ROOMS (100 total)
  // ────────────────────────────────────────────
  let roomCounter = 0;
  for (let mi = 0; mi < MOTEL_CONFIGS.length; mi++) {
    const cfg = MOTEL_CONFIGS[mi];
    const totalRooms = cfg.floors * cfg.roomsPerFloor;
    for (let f = 1; f <= cfg.floors; f++) {
      for (let r = 1; r <= cfg.roomsPerFloor; r++) {
        roomCounter++;
        const roomCode = `${cfg.roomPrefix}${f}${String(r).padStart(2, "0")}`;
        const roomId = `r-${roomCode.toLowerCase()}`;

        // Status distribution: 85% occupied, 10% vacant, 5% maintenance
        let status: RoomStatus;
        const pos = (f - 1) * cfg.roomsPerFloor + r;
        if (pos === totalRooms && totalRooms > 6) {
          status = RoomStatus.MAINTENANCE; // last room in large motels
        } else if (pos === totalRooms - 1 && totalRooms >= 8) {
          status = RoomStatus.VACANT; // second-to-last in 8+ room motels
        } else if (pos === totalRooms && totalRooms <= 6) {
          status = RoomStatus.VACANT; // last room in small motels
        } else {
          status = RoomStatus.OCCUPIED;
        }

        const area = randomInt(cfg.areaRange[0], cfg.areaRange[1]);
        const rent = roundRent(cfg.rentRange[0], cfg.rentRange[1]);
        const maxOcc = randomInt(cfg.maxOccupantsRange[0], cfg.maxOccupantsRange[1]);

        const room: RoomRecord = {
          id: roomId, motelId: motelIds[mi], roomCode, roomName: `Phong ${roomCode}`,
          floor: f, area, baseRentPrice: rent, maxOccupants: maxOcc,
          status, motelIndex: mi,
        };
        allRooms.push(room);

        await prisma.room.create({
          data: {
            id: room.id, motelId: room.motelId, roomCode: room.roomCode,
            roomName: room.roomName, floor: room.floor, area: room.area,
            baseRentPrice: room.baseRentPrice, maxOccupants: room.maxOccupants,
            status: room.status,
          },
        });
      }
    }
  }
  const occupiedRooms = allRooms.filter(r => r.status === RoomStatus.OCCUPIED);
  const vacantRooms = allRooms.filter(r => r.status === RoomStatus.VACANT);
  const maintRooms = allRooms.filter(r => r.status === RoomStatus.MAINTENANCE);
  console.log(`Rooms: ${allRooms.length} (${occupiedRooms.length} occupied, ${vacantRooms.length} vacant, ${maintRooms.length} maintenance)`);

  // ────────────────────────────────────────────
  // TENANTS (210: ~200 active + 5 inactive + 5 blacklisted)
  // ────────────────────────────────────────────
  let tenantCounter = 0;

  // Generate tenants per occupied room
  for (const room of occupiedRooms) {
    // Bias toward 2 occupants: 30% 1p, 50% 2p, 15% 3p, 5% 4p (capped by maxOccupants)
    const roll = seededRandom();
    let occ: number;
    if (roll < 0.30) occ = 1;
    else if (roll < 0.80) occ = 2;
    else if (roll < 0.95) occ = 3;
    else occ = 4;
    occ = Math.min(occ, room.maxOccupants);

    // Gender assignment for the room
    const genderRoll = seededRandom();
    let genders: ("Nam" | "Nu")[];
    if (occ === 1) {
      genders = [genderRoll < 0.5 ? "Nam" : "Nu"];
    } else {
      if (genderRoll < 0.40) genders = Array(occ).fill("Nam");
      else if (genderRoll < 0.70) genders = Array(occ).fill("Nu");
      else genders = Array(occ).fill(null).map((_, i) => i % 2 === 0 ? "Nam" : "Nu");
    }

    for (let p = 0; p < occ; p++) {
      tenantCounter++;
      const tid = `t-${String(tenantCounter).padStart(3, "0")}`;
      const gender = genders[p];
      const tenant: TenantRecord = {
        id: tid,
        fullName: generateFullName(gender),
        phoneNumber: generatePhone(tenantCounter),
        citizenId: generateCitizenId(tenantCounter),
        gender,
        permanentAddress: generatePermanentAddress(),
        status: TenantStatus.ACTIVE,
        note: p === 0 ? null : `O ghep phong ${room.roomCode}`,
      };
      allTenants.push(tenant);

      // Tag room association for contract creation later
      (room as any)._tenantIds = (room as any)._tenantIds || [];
      (room as any)._tenantIds.push(tid);
    }
  }

  // Add inactive tenants (7) - previously lived in vacant/maintenance rooms
  for (let i = 0; i < 7; i++) {
    tenantCounter++;
    const tid = `t-${String(tenantCounter).padStart(3, "0")}`;
    const gender: "Nam" | "Nu" = i % 2 === 0 ? "Nam" : "Nu";
    allTenants.push({
      id: tid, fullName: generateFullName(gender),
      phoneNumber: generatePhone(tenantCounter),
      citizenId: generateCitizenId(tenantCounter),
      gender, permanentAddress: generatePermanentAddress(),
      status: TenantStatus.INACTIVE,
      note: `Da chuyen di thang ${randomInt(9, 12)}/2025`,
    });
  }

  // Add blacklisted tenants (3)
  for (let i = 0; i < 3; i++) {
    tenantCounter++;
    const tid = `t-${String(tenantCounter).padStart(3, "0")}`;
    allTenants.push({
      id: tid, fullName: generateFullName("Nam"),
      phoneNumber: generatePhone(tenantCounter),
      citizenId: generateCitizenId(tenantCounter),
      gender: "Nam", permanentAddress: generatePermanentAddress(),
      status: TenantStatus.BLACKLISTED,
      note: `No ${randomInt(2, 5)} thang tien phong, bi cam`,
    });
  }

  // Batch create tenants
  await prisma.tenant.createMany({
    data: allTenants.map(t => ({
      id: t.id, fullName: t.fullName, phoneNumber: t.phoneNumber,
      citizenId: t.citizenId, gender: t.gender, permanentAddress: t.permanentAddress,
      status: t.status, note: t.note,
    })),
  });
  const activeTenants = allTenants.filter(t => t.status === TenantStatus.ACTIVE);
  console.log(`Tenants: ${allTenants.length} (${activeTenants.length} active, 7 inactive, 3 blacklisted)`);

  // ────────────────────────────────────────────
  // CONTRACTS + CONTRACT TENANTS
  // ────────────────────────────────────────────
  let contractCounter = 0;

  // Active contracts for occupied rooms
  const startMonths = ["2025-06-01", "2025-07-01", "2025-08-01", "2025-09-01", "2025-10-01", "2025-11-01", "2026-01-01"];

  for (const room of occupiedRooms) {
    contractCounter++;
    const tenantIds: string[] = (room as any)._tenantIds ?? [];
    if (tenantIds.length === 0) continue;

    const cfg = MOTEL_CONFIGS[room.motelIndex];
    const cid = `c-${String(contractCounter).padStart(3, "0")}`;
    const startDate = startMonths[contractCounter % startMonths.length];
    const endYear = parseInt(startDate.slice(0, 4)) + 1;
    const endDate = `${endYear}${startDate.slice(4)}`;

    const rent = room.baseRentPrice;
    const contract: ContractRecord = {
      id: cid,
      code: `HD${startDate.replace(/-/g, "").slice(2, 8)}-${cfg.roomPrefix}${String(contractCounter).padStart(2, "0")}`,
      motelId: room.motelId, roomId: room.id,
      repTenantId: tenantIds[0], occupants: tenantIds.length,
      rent, deposit: rent * 2, serviceFee: cfg.serviceFee,
      start: startDate, end: endDate, status: ContractStatus.ACTIVE,
      members: tenantIds.map((tid, i) => ({ tenantId: tid, isRep: i === 0 })),
      motelIndex: room.motelIndex,
    };
    allContracts.push(contract);
  }

  // Ended contracts (5) - for some inactive tenants, using vacant/maintenance rooms
  const endedRooms = [...vacantRooms.slice(0, 3), ...maintRooms.slice(0, 2)];
  const inactiveTenants = allTenants.filter(t => t.status === TenantStatus.INACTIVE);
  for (let i = 0; i < Math.min(5, endedRooms.length); i++) {
    contractCounter++;
    const room = endedRooms[i];
    const tid = inactiveTenants[i]?.id;
    if (!tid) continue;
    const cfg = MOTEL_CONFIGS[room.motelIndex];
    const cid = `c-${String(contractCounter).padStart(3, "0")}`;
    allContracts.push({
      id: cid,
      code: `HD250301-END${String(i + 1).padStart(2, "0")}`,
      motelId: room.motelId, roomId: room.id,
      repTenantId: tid, occupants: 1,
      rent: room.baseRentPrice, deposit: room.baseRentPrice * 2,
      serviceFee: cfg.serviceFee,
      start: "2025-03-01", end: "2025-12-31", status: ContractStatus.ENDED,
      members: [{ tenantId: tid, isRep: true }],
      motelIndex: room.motelIndex,
    });
  }

  // Cancelled contracts (5) - for blacklisted tenants
  const blacklisted = allTenants.filter(t => t.status === TenantStatus.BLACKLISTED);
  for (let i = 0; i < Math.min(3, blacklisted.length); i++) {
    contractCounter++;
    const room = endedRooms[i] ?? vacantRooms[i];
    if (!room) continue;
    const cfg = MOTEL_CONFIGS[room.motelIndex];
    const cid = `c-${String(contractCounter).padStart(3, "0")}`;
    allContracts.push({
      id: cid,
      code: `HD250501-CAN${String(i + 1).padStart(2, "0")}`,
      motelId: room.motelId, roomId: room.id,
      repTenantId: blacklisted[i].id, occupants: 1,
      rent: room.baseRentPrice, deposit: room.baseRentPrice * 2,
      serviceFee: cfg.serviceFee,
      start: "2025-05-01", end: "2025-11-30", status: ContractStatus.CANCELLED,
      members: [{ tenantId: blacklisted[i].id, isRep: true }],
      motelIndex: room.motelIndex,
    });
  }

  // Create all contracts with contract tenants
  for (const c of allContracts) {
    await prisma.contract.create({
      data: {
        id: c.id, contractCode: c.code, motelId: c.motelId, roomId: c.roomId,
        representativeTenantId: c.repTenantId,
        startDate: new Date(c.start), endDate: new Date(c.end), signedDate: new Date(c.start),
        rentAmount: c.rent, depositAmount: c.deposit, serviceFee: c.serviceFee,
        occupantCount: c.occupants, status: c.status, createdById: owner.id,
        contractTenants: {
          create: c.members.map(m => ({
            tenantId: m.tenantId, isRepresentative: m.isRep, joinedAt: new Date(c.start),
          })),
        },
      },
    });
  }
  const activeContracts = allContracts.filter(c => c.status === ContractStatus.ACTIVE);
  const endedContracts = allContracts.filter(c => c.status === ContractStatus.ENDED);
  const cancelledContracts = allContracts.filter(c => c.status === ContractStatus.CANCELLED);
  const totalCT = allContracts.reduce((s, c) => s + c.members.length, 0);
  console.log(`Contracts: ${allContracts.length} (${activeContracts.length} active, ${endedContracts.length} ended, ${cancelledContracts.length} cancelled)`);
  console.log(`ContractTenants: ${totalCT}`);

  // ────────────────────────────────────────────
  // VEHICLES
  // ────────────────────────────────────────────
  let vehicleCounter = 0;
  for (const tenant of activeTenants) {
    const vehicles = generateVehicleForTenant();
    for (const v of vehicles) {
      vehicleCounter++;
      const vid = `v-${String(vehicleCounter).padStart(3, "0")}`;
      const plate = generateLicensePlate(v.type, vehicleCounter);
      const imgIdx = (vehicleCounter - 1) % vehicleImgPool.length;
      allVehicles.push({
        id: vid, tenantId: tenant.id, plate, type: v.type as VehicleType,
        brand: v.brand, color: v.color, fee: v.fee,
        desc: `${v.brand} - ${v.color}`,
        images: [vehicleImgPool[imgIdx]],
      });
    }
  }

  // Batch create vehicles
  await prisma.vehicle.createMany({
    data: allVehicles.map(v => ({
      id: v.id, tenantId: v.tenantId, licensePlate: v.plate,
      vehicleType: v.type, brand: v.brand, color: v.color,
      monthlyFee: v.fee, description: v.desc, images: v.images,
      status: VehicleStatus.ACTIVE,
    })),
  });
  console.log(`Vehicles: ${allVehicles.length}`);

  // ────────────────────────────────────────────
  // METER READINGS - 3 months: Jan, Feb, Mar 2026
  // ────────────────────────────────────────────
  const MONTH_FACTORS = [0.95, 1.00, 1.08]; // Jan, Feb, Mar (winter -> spring)
  let meterCounter = 0;

  for (const contract of activeContracts) {
    const room = allRooms.find(r => r.id === contract.roomId)!;
    const cfg = MOTEL_CONFIGS[contract.motelIndex];
    const occ = contract.occupants;

    // Cumulative meter starting points (simulating running since move-in)
    let elecRunning = randomInt(200, 1200);
    let waterRunning = randomInt(15, 100);

    for (let monthIdx = 0; monthIdx < 3; monthIdx++) {
      meterCounter++;
      const month = monthIdx + 1; // Jan=1, Feb=2, Mar=3
      const factor = MONTH_FACTORS[monthIdx];

      const elecUsage = generateElecUsage(occ, factor);
      const waterUsage = generateWaterUsage(occ, factor);

      const elecPrev = elecRunning;
      const elecCurr = elecRunning + elecUsage;
      const waterPrev = waterRunning;
      const waterCurr = waterRunning + waterUsage;

      elecRunning = elecCurr;
      waterRunning = waterCurr;

      const mid = `mr-${String(meterCounter).padStart(4, "0")}`;
      const meter: MeterRecord = {
        id: mid, motelId: contract.motelId, roomId: contract.roomId,
        contractId: contract.id, month, year: 2026,
        elecPrev, elecCurr, elecPrice: cfg.elecPrice,
        waterPrev, waterCurr, waterPrice: cfg.waterPrice,
        locked: month < 3, // Jan, Feb locked; Mar unlocked
      };
      allMeters.push(meter);
    }
  }

  // Batch create meter readings
  await prisma.meterReading.createMany({
    data: allMeters.map(mr => ({
      id: mr.id, motelId: mr.motelId, roomId: mr.roomId, contractId: mr.contractId,
      readingMonth: mr.month, readingYear: mr.year,
      electricityPrevious: mr.elecPrev, electricityCurrent: mr.elecCurr,
      electricityUsage: mr.elecCurr - mr.elecPrev, electricityUnitPrice: mr.elecPrice,
      waterPrevious: mr.waterPrev, waterCurrent: mr.waterCurr,
      waterUsage: mr.waterCurr - mr.waterPrev, waterUnitPrice: mr.waterPrice,
      recordedDate: new Date(2026, mr.month - 1, 28),
      isLocked: mr.locked, createdById: owner.id,
    })),
  });
  console.log(`Meter Readings: ${allMeters.length}`);

  // ────────────────────────────────────────────
  // INVOICES + INVOICE ITEMS + PAYMENTS
  // ────────────────────────────────────────────
  let invoiceCounter = 0;
  let paymentCounter = 0;

  // Helper: parking fee for a contract
  function parkingFee(contractId: string): number {
    const c = allContracts.find(ct => ct.id === contractId)!;
    const tids = c.members.map(m => m.tenantId);
    return allVehicles
      .filter(v => tids.includes(v.tenantId))
      .reduce((sum, v) => sum + v.fee, 0);
  }

  // March status distribution for variety
  // 50% PAID, 15% ISSUED, 10% PARTIALLY_PAID, 10% DRAFT, 15% OVERDUE
  function marchStatus(idx: number): { status: InvoiceStatus; paidRatio: number } {
    const pattern = idx % 20;
    if (pattern < 10) return { status: InvoiceStatus.PAID, paidRatio: 1 };        // 50% PAID
    if (pattern < 13) return { status: InvoiceStatus.ISSUED, paidRatio: 0 };      // 15% ISSUED
    if (pattern < 15) return { status: InvoiceStatus.PARTIALLY_PAID, paidRatio: 0.5 }; // 10% PARTIAL
    if (pattern < 17) return { status: InvoiceStatus.DRAFT, paidRatio: 0 };       // 10% DRAFT
    return { status: InvoiceStatus.OVERDUE, paidRatio: 0 };                        // 15% OVERDUE
  }

  for (const mr of allMeters) {
    invoiceCounter++;
    const contract = allContracts.find(c => c.id === mr.contractId)!;
    const room = allRooms.find(r => r.id === mr.roomId)!;
    const tenant = allTenants.find(t => t.id === contract.repTenantId)!;

    const elecUsage = mr.elecCurr - mr.elecPrev;
    const waterUsage = mr.waterCurr - mr.waterPrev;
    const elecAmount = elecUsage * mr.elecPrice;
    const waterAmount = waterUsage * mr.waterPrice;
    const parking = parkingFee(mr.contractId);
    const totalAmount = contract.rent + elecAmount + waterAmount + contract.serviceFee + parking;

    // Determine status & paid ratio
    let status: InvoiceStatus;
    let paidRatio: number;
    if (mr.month <= 2) {
      status = InvoiceStatus.PAID;
      paidRatio = 1;
    } else {
      const ms = marchStatus(invoiceCounter);
      status = ms.status;
      paidRatio = ms.paidRatio;
    }

    const paidAmount = Math.floor(totalAmount * paidRatio);
    const invId = `inv-${String(invoiceCounter).padStart(4, "0")}`;
    const invCode = `INV2602${String(mr.month).padStart(2, "0")}-${String(invoiceCounter).padStart(3, "0")}`;

    const billingDate = mr.month <= 2
      ? `2026-${String(mr.month + 1).padStart(2, "0")}-01`
      : "2026-03-21";
    const dueDate = mr.month <= 2
      ? `2026-${String(mr.month + 1).padStart(2, "0")}-05`
      : "2026-04-05";

    // Invoice items
    const items: { itemType: InvoiceItemType; description: string; quantity: number; unitPrice: number; amount: number; sortOrder: number }[] = [
      { itemType: InvoiceItemType.ROOM_RENT, description: "Tien phong", quantity: 1, unitPrice: contract.rent, amount: contract.rent, sortOrder: 1 },
      { itemType: InvoiceItemType.ELECTRICITY, description: `Tien dien (${elecUsage} kWh x ${mr.elecPrice.toLocaleString()}d)`, quantity: elecUsage, unitPrice: mr.elecPrice, amount: elecAmount, sortOrder: 2 },
      { itemType: InvoiceItemType.WATER, description: `Tien nuoc (${waterUsage} m3 x ${mr.waterPrice.toLocaleString()}d)`, quantity: waterUsage, unitPrice: mr.waterPrice, amount: waterAmount, sortOrder: 3 },
      { itemType: InvoiceItemType.SERVICE_FEE, description: "Phi dich vu", quantity: 1, unitPrice: contract.serviceFee, amount: contract.serviceFee, sortOrder: 4 },
    ];
    if (parking > 0) {
      const vCount = allVehicles.filter(v => contract.members.some(m => m.tenantId === v.tenantId)).length;
      items.push({
        itemType: InvoiceItemType.OTHER,
        description: `Phi gui xe (${vCount} phuong tien)`,
        quantity: vCount, unitPrice: vCount > 0 ? Math.round(parking / vCount) : 0,
        amount: parking, sortOrder: 5,
      });
    }

    await prisma.invoice.create({
      data: {
        id: invId, invoiceCode: invCode, motelId: mr.motelId, roomId: mr.roomId,
        contractId: mr.contractId, representativeTenantId: contract.repTenantId,
        meterReadingId: mr.id,
        invoiceMonth: mr.month, invoiceYear: mr.year,
        billingDate: new Date(billingDate), dueDate: new Date(dueDate),
        roomSnapshot: JSON.stringify({ roomCode: room.roomCode, roomName: room.roomName }),
        tenantSnapshot: JSON.stringify({ fullName: tenant.fullName, phoneNumber: tenant.phoneNumber }),
        rentAmount: contract.rent, electricityAmount: elecAmount, waterAmount: waterAmount,
        serviceFeeAmount: contract.serviceFee, surchargeAmount: 0, discountAmount: 0,
        totalAmount, paidAmount, status,
        createdById: owner.id,
        invoiceItems: { create: items },
      },
    });

    // Create payment if paid
    if (paidAmount > 0) {
      paymentCounter++;
      const payCode = `PAY${invCode.replace("INV", "")}`;
      await prisma.payment.create({
        data: {
          invoiceId: invId, paymentCode: payCode, amount: paidAmount,
          paymentDate: new Date(billingDate),
          paymentMethod: paidRatio >= 1 ? PaymentMethod.BANK_TRANSFER : PaymentMethod.CASH,
          referenceNumber: paidRatio >= 1 ? `VCB-${String(paymentCounter).padStart(4, "0")}` : undefined,
          note: paidRatio >= 1
            ? `Thanh toan thang ${mr.month}/${mr.year}`
            : `Tra truoc mot phan thang ${mr.month}/${mr.year}`,
          recordedById: paidRatio >= 1 ? owner.id : staffList[0].id,
        },
      });
    }
  }
  console.log(`Invoices: ${invoiceCounter} (with items)`);
  console.log(`Payments: ${paymentCounter}`);

  // ────────────────────────────────────────────
  // FEEDBACKS (35)
  // ────────────────────────────────────────────
  const feedbackStatuses: FeedbackStatus[] = [
    ...Array(10).fill(FeedbackStatus.NEW),
    ...Array(8).fill(FeedbackStatus.IN_PROGRESS),
    ...Array(10).fill(FeedbackStatus.RESOLVED),
    ...Array(7).fill(FeedbackStatus.CLOSED),
  ];
  const shuffledStatuses = shuffled(feedbackStatuses);
  const shuffledTemplates = shuffled([...FEEDBACK_TEMPLATES]).slice(0, 35);

  // Pad if less than 35 templates by repeating
  while (shuffledTemplates.length < 35) {
    shuffledTemplates.push(randomPick(FEEDBACK_TEMPLATES));
  }

  let fbCounter = 0;
  for (let i = 0; i < 35; i++) {
    fbCounter++;
    const tmpl = shuffledTemplates[i];
    const stat = shuffledStatuses[i];

    // Pick random active contract's tenant + room
    const contract = randomPick(activeContracts);
    const tenantId = randomPick(contract.members).tenantId;
    const room = allRooms.find(r => r.id === contract.roomId)!;

    const isResolved = stat === FeedbackStatus.RESOLVED || stat === FeedbackStatus.CLOSED;
    const assignedTo = stat !== FeedbackStatus.NEW ? randomPick(staffList).id : null;
    const resolution = isResolved ? randomPick(RESOLUTION_TEMPLATES) : null;

    await prisma.feedback.create({
      data: {
        id: `fb-${String(fbCounter).padStart(3, "0")}`,
        title: tmpl.title, description: tmpl.description,
        category: tmpl.category as FeedbackCategory,
        priority: tmpl.priority as FeedbackPriority,
        status: stat,
        tenantId, motelId: contract.motelId, roomId: room.id,
        createdById: seededRandom() < 0.7 ? owner.id : staffList[0].id,
        assignedToId: assignedTo,
        resolution,
      },
    });
  }
  console.log(`Feedbacks: ${fbCounter}`);

  // ────────────────────────────────────────────
  // SUMMARY
  // ────────────────────────────────────────────
  console.log("\n========================================");
  console.log("  SEED COMPLETED SUCCESSFULLY!");
  console.log("========================================");
  console.log(`  Users:            4 (1 owner + 3 staff)`);
  console.log(`  Motels:           ${motelIds.length}`);
  console.log(`  Rooms:            ${allRooms.length} (${occupiedRooms.length} occupied, ${vacantRooms.length} vacant, ${maintRooms.length} maintenance)`);
  console.log(`  Tenants:          ${allTenants.length} (${activeTenants.length} active, 7 inactive, 3 blacklisted)`);
  console.log(`  Contracts:        ${allContracts.length} (${activeContracts.length} active, ${endedContracts.length} ended, ${cancelledContracts.length} cancelled)`);
  console.log(`  ContractTenants:  ${totalCT}`);
  console.log(`  Vehicles:         ${allVehicles.length}`);
  console.log(`  Meter Readings:   ${allMeters.length}`);
  console.log(`  Invoices:         ${invoiceCounter}`);
  console.log(`  Payments:         ${paymentCounter}`);
  console.log(`  Feedbacks:        ${fbCounter}`);
  console.log("========================================");
  console.log("  Login: owner@example.com / 123456");
  console.log("  Login: staff1@example.com / 123456");
  console.log("  Login: staff2@example.com / 123456");
  console.log("  Login: staff3@example.com / 123456");
  console.log("========================================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
