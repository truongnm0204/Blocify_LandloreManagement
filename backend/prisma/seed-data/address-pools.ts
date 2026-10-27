// Address pools for tenants and motel locations

export const PROVINCES = [
  "Ha Noi", "Ha Nam", "Nam Dinh", "Thai Binh", "Ninh Binh",
  "Hai Phong", "Bac Ninh", "Hung Yen", "Hai Duong", "Vinh Phuc",
  "Bac Giang", "Phu Tho", "Thai Nguyen", "Nghe An", "Ha Tinh",
  "Thanh Hoa", "Hoa Binh", "Son La", "Quang Ninh", "Lang Son",
];

export interface MotelConfig {
  name: string;
  address: string;
  description: string;
  elecPrice: number;
  waterPrice: number;
  serviceFee: number;
  paymentDueDay: number;
  floors: number;
  roomsPerFloor: number;
  // Room config
  roomPrefix: string;
  areaRange: [number, number];      // m2
  rentRange: [number, number];       // VND
  maxOccupantsRange: [number, number];
}

export const MOTEL_CONFIGS: MotelConfig[] = [
  {
    name: "Nha tro Binh Minh", address: "12 Tran Dai Nghia, Hoa Lac, Ha Noi",
    description: "Nha tro gan truong dai hoc FPT, an ninh tot, bai dau xe rong. Phu hop sinh vien va nguoi di lam.",
    elecPrice: 3500, waterPrice: 15000, serviceFee: 100000, paymentDueDay: 5,
    floors: 3, roomsPerFloor: 4, roomPrefix: "A",
    areaRange: [18, 25], rentRange: [2000000, 3000000], maxOccupantsRange: [2, 4],
  },
  {
    name: "Nha tro Hoang Gia", address: "45 Nguyen Trai, Thanh Xuan, Ha Noi",
    description: "Nha tro cao cap khu Thanh Xuan, thang may, bao ve 24/7, dieu hoa tung phong.",
    elecPrice: 3800, waterPrice: 18000, serviceFee: 150000, paymentDueDay: 10,
    floors: 2, roomsPerFloor: 5, roomPrefix: "B",
    areaRange: [25, 35], rentRange: [3500000, 4500000], maxOccupantsRange: [2, 4],
  },
  {
    name: "Nha tro Phuoc An", address: "78 Xuan Thuy, Cau Giay, Ha Noi",
    description: "Tro nho khu Cau Giay, gan Dai hoc Quoc gia. Yeu tinh, tien di lai.",
    elecPrice: 3800, waterPrice: 17000, serviceFee: 120000, paymentDueDay: 5,
    floors: 2, roomsPerFloor: 4, roomPrefix: "C",
    areaRange: [20, 30], rentRange: [3000000, 4000000], maxOccupantsRange: [2, 3],
  },
  {
    name: "Nha tro Tan Phat", address: "23 Quang Trung, Ha Dong, Ha Noi",
    description: "Khu tro rong rai Ha Dong, gan cho va sieu thi. Bai xe rong, camera an ninh.",
    elecPrice: 3500, waterPrice: 15000, serviceFee: 100000, paymentDueDay: 5,
    floors: 3, roomsPerFloor: 4, roomPrefix: "D",
    areaRange: [18, 28], rentRange: [2500000, 3500000], maxOccupantsRange: [2, 4],
  },
  {
    name: "Nha tro Minh Quang", address: "56 Thai Ha, Dong Da, Ha Noi",
    description: "Tro cao cap khu Dong Da, gan benh vien Bach Mai. Thich hop cap doi va nguoi di lam.",
    elecPrice: 3800, waterPrice: 18000, serviceFee: 130000, paymentDueDay: 10,
    floors: 2, roomsPerFloor: 4, roomPrefix: "E",
    areaRange: [22, 32], rentRange: [3500000, 4500000], maxOccupantsRange: [2, 3],
  },
  {
    name: "Nha tro Hai Dang", address: "89 Nguyen Van Cu, Long Bien, Ha Noi",
    description: "Tro khu Long Bien, gan cau Chuong Duong. Gia re, phu hop cong nhan KCN.",
    elecPrice: 3500, waterPrice: 16000, serviceFee: 110000, paymentDueDay: 5,
    floors: 2, roomsPerFloor: 5, roomPrefix: "F",
    areaRange: [18, 25], rentRange: [2500000, 3500000], maxOccupantsRange: [2, 4],
  },
  {
    name: "Nha tro Thien Phuc", address: "34 Co Nhue, Bac Tu Liem, Ha Noi",
    description: "Tro moi xay Bac Tu Liem, gan KCN. Phong rong, thoang mat. Gia binh dan.",
    elecPrice: 3500, waterPrice: 15000, serviceFee: 100000, paymentDueDay: 5,
    floors: 3, roomsPerFloor: 4, roomPrefix: "G",
    areaRange: [20, 28], rentRange: [2000000, 3000000], maxOccupantsRange: [2, 4],
  },
  {
    name: "Nha tro Van Xuan", address: "67 Pham Hung, Nam Tu Liem, Ha Noi",
    description: "Tro khu Nam Tu Liem, gan Keangnam. Phu hop nhan vien van phong.",
    elecPrice: 3800, waterPrice: 17000, serviceFee: 120000, paymentDueDay: 10,
    floors: 2, roomsPerFloor: 5, roomPrefix: "H",
    areaRange: [22, 30], rentRange: [3000000, 4000000], maxOccupantsRange: [2, 3],
  },
  {
    name: "Nha tro Kim Long", address: "112 Linh Dam, Hoang Mai, Ha Noi",
    description: "Tro khu Linh Dam, gan ho dieu hoa. Moi truong xanh, yen tinh.",
    elecPrice: 3500, waterPrice: 16000, serviceFee: 110000, paymentDueDay: 5,
    floors: 2, roomsPerFloor: 4, roomPrefix: "K",
    areaRange: [20, 26], rentRange: [2500000, 3500000], maxOccupantsRange: [2, 3],
  },
  {
    name: "Nha tro Dai Thanh", address: "45 Co Bi, Gia Lam, Ha Noi",
    description: "Tro khu Gia Lam, gan KCN va truong Nong nghiep. Gia re nhat khu vuc.",
    elecPrice: 3500, waterPrice: 15000, serviceFee: 100000, paymentDueDay: 5,
    floors: 2, roomsPerFloor: 5, roomPrefix: "L",
    areaRange: [18, 25], rentRange: [2000000, 3000000], maxOccupantsRange: [2, 4],
  },
];
