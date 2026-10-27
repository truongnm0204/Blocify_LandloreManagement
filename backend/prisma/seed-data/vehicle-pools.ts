// Vehicle brand and color pools

export interface VehicleBrand {
  name: string;
  type: "MOTORCYCLE" | "CAR" | "ELECTRIC_BIKE" | "BICYCLE";
}

export const MOTORCYCLE_BRANDS: VehicleBrand[] = [
  { name: "Honda Wave Alpha", type: "MOTORCYCLE" },
  { name: "Honda Vision", type: "MOTORCYCLE" },
  { name: "Honda Air Blade", type: "MOTORCYCLE" },
  { name: "Honda SH 150i", type: "MOTORCYCLE" },
  { name: "Honda Winner X", type: "MOTORCYCLE" },
  { name: "Honda Lead 125", type: "MOTORCYCLE" },
  { name: "Honda Future", type: "MOTORCYCLE" },
  { name: "Yamaha Sirius", type: "MOTORCYCLE" },
  { name: "Yamaha Exciter 155", type: "MOTORCYCLE" },
  { name: "Yamaha NVX 155", type: "MOTORCYCLE" },
  { name: "Yamaha Janus", type: "MOTORCYCLE" },
  { name: "Suzuki Raider", type: "MOTORCYCLE" },
  { name: "SYM Angela", type: "MOTORCYCLE" },
  { name: "Piaggio Liberty", type: "MOTORCYCLE" },
  { name: "Piaggio Vespa Sprint", type: "MOTORCYCLE" },
];

export const CAR_BRANDS: VehicleBrand[] = [
  { name: "Toyota Vios 2023", type: "CAR" },
  { name: "Hyundai Accent 2024", type: "CAR" },
  { name: "Kia Morning 2023", type: "CAR" },
  { name: "Mazda CX-5 2024", type: "CAR" },
  { name: "VinFast VF5 Plus", type: "CAR" },
];

export const EBIKE_BRANDS: VehicleBrand[] = [
  { name: "VinFast Ludo", type: "ELECTRIC_BIKE" },
  { name: "Yadea Xmen", type: "ELECTRIC_BIKE" },
  { name: "DTP X-Men", type: "ELECTRIC_BIKE" },
  { name: "Pega NewTech", type: "ELECTRIC_BIKE" },
  { name: "Nijia X5", type: "ELECTRIC_BIKE" },
];

export const BICYCLE_BRANDS: VehicleBrand[] = [
  { name: "Giant ATX 830", type: "BICYCLE" },
  { name: "Trinx M500", type: "BICYCLE" },
  { name: "Fornix BT301", type: "BICYCLE" },
];

export const VEHICLE_COLORS = [
  "Den", "Trang", "Do", "Xanh", "Bac", "Vang", "Nau", "Xam",
  "Den nham", "Do do", "Xanh reu", "Hong", "Cam", "Tim",
];

// Parking fees by vehicle type
export const PARKING_FEES: Record<string, number> = {
  MOTORCYCLE: 100000,
  CAR: 500000,
  ELECTRIC_BIKE: 50000,
  BICYCLE: 0,
  OTHER: 50000,
};
