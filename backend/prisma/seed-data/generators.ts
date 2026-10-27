// Utility functions for deterministic seed data generation

import {
  LAST_NAMES, MIDDLE_NAMES_MALE, MIDDLE_NAMES_FEMALE,
  FIRST_NAMES_MALE, FIRST_NAMES_FEMALE,
} from "./vietnamese-names";
import { PROVINCES } from "./address-pools";
import {
  MOTORCYCLE_BRANDS, CAR_BRANDS, EBIKE_BRANDS, BICYCLE_BRANDS,
  VEHICLE_COLORS, PARKING_FEES,
} from "./vehicle-pools";

// --- Seeded random for reproducibility ---
let _seed = 42;
export function setSeed(s: number) { _seed = s; }
export function seededRandom(): number {
  _seed = (_seed * 16807 + 0) % 2147483647;
  return (_seed - 1) / 2147483646;
}
export function randomInt(min: number, max: number): number {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}
export function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(seededRandom() * arr.length)];
}
export function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// --- Name generation ---
const usedNames = new Set<string>();

export function generateFullName(gender: "Nam" | "Nu"): string {
  for (let attempt = 0; attempt < 100; attempt++) {
    const last = randomPick(LAST_NAMES);
    const middle = gender === "Nam"
      ? randomPick(MIDDLE_NAMES_MALE)
      : randomPick(MIDDLE_NAMES_FEMALE);
    const first = gender === "Nam"
      ? randomPick(FIRST_NAMES_MALE)
      : randomPick(FIRST_NAMES_FEMALE);
    const name = `${last} ${middle} ${first}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }
  // Fallback: append number
  const base = `${randomPick(LAST_NAMES)} ${randomPick(MIDDLE_NAMES_MALE)} ${randomPick(FIRST_NAMES_MALE)}`;
  const unique = `${base} ${usedNames.size}`;
  usedNames.add(unique);
  return unique;
}

export function resetNameTracker() { usedNames.clear(); }

// --- Phone & ID generation ---
const PHONE_PREFIXES = ["090", "091", "093", "094", "096", "097", "098", "032", "033", "034", "035", "036", "037", "038", "039"];

export function generatePhone(index: number): string {
  const prefix = PHONE_PREFIXES[index % PHONE_PREFIXES.length];
  const suffix = String(100000 + index).slice(-7);
  return `${prefix}${suffix}`;
}

export function generateCitizenId(index: number): string {
  // Format: 034 0 99 xxxxxx (Ha Noi area code pattern)
  const area = String(1 + (index % 63)).padStart(3, "0");
  const seq = String(100000 + index).slice(-6);
  return `${area}099${seq}`;
}

// --- License plate generation ---
const PLATE_PREFIXES_MOTO = ["29B1", "29H1", "29X1", "29V1", "29P1", "30F1", "34A1", "15B1", "37B1", "36B1"];
const PLATE_PREFIXES_CAR = ["30A", "29A", "30E", "30F", "30G"];

export function generateLicensePlate(type: string, index: number): string {
  if (type === "CAR") {
    const prefix = PLATE_PREFIXES_CAR[index % PLATE_PREFIXES_CAR.length];
    return `${prefix}-${String(10000 + index).slice(-5)}`;
  }
  if (type === "BICYCLE" || type === "ELECTRIC_BIKE") {
    return `KXD-${String(100 + index).slice(-3)}`;
  }
  const prefix = PLATE_PREFIXES_MOTO[index % PLATE_PREFIXES_MOTO.length];
  return `${prefix}-${String(10000 + index).slice(-5)}`;
}

// --- Vehicle generation ---
export interface GeneratedVehicle {
  type: "MOTORCYCLE" | "CAR" | "ELECTRIC_BIKE" | "BICYCLE";
  brand: string;
  color: string;
  fee: number;
}

export function generateVehicleForTenant(): GeneratedVehicle[] {
  const roll = seededRandom();
  const vehicles: GeneratedVehicle[] = [];

  if (roll < 0.05) {
    // 5% no vehicle
    return vehicles;
  } else if (roll < 0.10) {
    // 5% bicycle only
    const b = randomPick(BICYCLE_BRANDS);
    vehicles.push({ type: "BICYCLE", brand: b.name, color: randomPick(VEHICLE_COLORS), fee: PARKING_FEES.BICYCLE });
  } else if (roll < 0.20) {
    // 10% electric bike
    const b = randomPick(EBIKE_BRANDS);
    vehicles.push({ type: "ELECTRIC_BIKE", brand: b.name, color: randomPick(VEHICLE_COLORS), fee: PARKING_FEES.ELECTRIC_BIKE });
  } else if (roll < 0.30) {
    // 10% car (+ maybe motorcycle)
    const c = randomPick(CAR_BRANDS);
    vehicles.push({ type: "CAR", brand: c.name, color: randomPick(VEHICLE_COLORS), fee: PARKING_FEES.CAR });
    if (seededRandom() < 0.5) {
      const m = randomPick(MOTORCYCLE_BRANDS);
      vehicles.push({ type: "MOTORCYCLE", brand: m.name, color: randomPick(VEHICLE_COLORS), fee: PARKING_FEES.MOTORCYCLE });
    }
  } else {
    // 70% motorcycle
    const m = randomPick(MOTORCYCLE_BRANDS);
    vehicles.push({ type: "MOTORCYCLE", brand: m.name, color: randomPick(VEHICLE_COLORS), fee: PARKING_FEES.MOTORCYCLE });
  }

  return vehicles;
}

// --- Meter reading helpers ---
export function generateElecUsage(occupants: number, monthFactor: number): number {
  // Base: 50-65 kWh per person per month
  const perPerson = randomInt(50, 65);
  return Math.round(occupants * perPerson * monthFactor);
}

export function generateWaterUsage(occupants: number, monthFactor: number): number {
  // Base: 4-6 m3 per person per month
  const perPerson = randomInt(4, 6);
  return Math.round(occupants * perPerson * monthFactor);
}

// --- Province for permanent address ---
export function generatePermanentAddress(): string {
  return randomPick(PROVINCES);
}

// --- Round rent to nearest 100K ---
export function roundRent(min: number, max: number): number {
  const raw = randomInt(min, max);
  return Math.round(raw / 100000) * 100000;
}
