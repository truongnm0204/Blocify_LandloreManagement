// Feedback templates for realistic seed data

export interface FeedbackTemplate {
  title: string;
  description: string;
  category: "MAINTENANCE" | "NOISE" | "UTILITIES" | "SECURITY" | "CLEANLINESS" | "OTHER";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

export const FEEDBACK_TEMPLATES: FeedbackTemplate[] = [
  // MAINTENANCE (8)
  { title: "Bon rua bi tat nghien", description: "Bon rua trong phong tam bi tat, nuoc thoat rat cham. Da thu thong bang lo xo nhung khong duoc.", category: "MAINTENANCE", priority: "HIGH" },
  { title: "Cua phong bi ket khi dong", description: "Cua phong khong dong duoc kin, phai dung luc manh. Ban le bi lech hoac khung cua cong venh.", category: "MAINTENANCE", priority: "MEDIUM" },
  { title: "Tuong phong tam bi am moc", description: "Goc tuong phia bon tam bi am, xuat hien vet moc den. Da lau nhieu lan nhung moc quay lai.", category: "MAINTENANCE", priority: "MEDIUM" },
  { title: "Dieu hoa khong lanh du", description: "May dieu hoa bat 18 do nhung phong van nong. Co mui hoi khi bat. Can ve sinh hoac nap gas.", category: "MAINTENANCE", priority: "HIGH" },
  { title: "Voi nuoc phong tam bi ro", description: "Voi nuoc phong tam bi nho giot lien tuc ca khi da van chat. Ton nuoc va kho chiu ban dem.", category: "MAINTENANCE", priority: "LOW" },
  { title: "May giat chung bi hong", description: "May giat tang 1 khong vat duoc, quay yeu va rung manh. Can sua hoac thay moi.", category: "MAINTENANCE", priority: "HIGH" },
  { title: "O cam dien bi long", description: "O cam dien phia ban hoc bi long, co tia lua khi cam sac dien thoai. Rat nguy hiem.", category: "MAINTENANCE", priority: "URGENT" },
  { title: "Tran nha bi tham nuoc", description: "Tran nha goc phong ngu bi tham nuoc khi troi mua. Nghi do chong tham tang thuong hong.", category: "MAINTENANCE", priority: "HIGH" },

  // NOISE (4)
  { title: "Phong ben on ao qua 23h", description: "Phong ben canh thuong xem phim, nghe nhac to sau 23h, anh huong giac ngu. Da nhac nhieu lan.", category: "NOISE", priority: "MEDIUM" },
  { title: "Cho trong khuon vien sua dem", description: "Co cho hoang trong khuon vien tro sua lien tuc tu 1-4h sang. Khong ngu duoc nhieu dem lien.", category: "NOISE", priority: "LOW" },
  { title: "Cong trinh ben canh on", description: "Cong trinh xay dung sat ben tro lam viec tu 6h sang, tieng khoan nen rat on. Keo dai 2 tuan.", category: "NOISE", priority: "MEDIUM" },
  { title: "Karaoke cuoi tuan on ao", description: "Phong tang 2 hat karaoke moi cuoi tuan den 1-2h sang. Nhieu phong deu phan anh.", category: "NOISE", priority: "HIGH" },

  // UTILITIES (7)
  { title: "Nuoc yeu vao gio cao diem", description: "Tu 17h-20h nuoc len tang tren rat yeu, khong du ap luc de tam va giat.", category: "UTILITIES", priority: "HIGH" },
  { title: "Wifi mat lien tuc", description: "Tu 2 tuan nay wifi bi mat 3-4 lan/ngay, moi lan mat 15-30 phut. Anh huong lam viec.", category: "UTILITIES", priority: "HIGH" },
  { title: "Mat dien dot ngot ban dem", description: "Tuan truoc mat dien 2 lan vao ban dem, moi lan khoang 1-2 tieng. Khong co thong bao truoc.", category: "UTILITIES", priority: "URGENT" },
  { title: "Bong den hanh lang bi chay", description: "Den hanh lang tang 2 bi chay tu tuan truoc. Di lai ban dem rat toi va nguy hiem.", category: "UTILITIES", priority: "LOW" },
  { title: "Binh nong lanh khong nong", description: "Binh nong lanh bat len nhung nuoc chi am, khong nong du. Nghi bi hong thanh dot nhiet.", category: "UTILITIES", priority: "MEDIUM" },
  { title: "Nuoc co mui la", description: "Nuoc sinh hoat co mui tanh nhẹ tu dau thang. Nghi do bon chua nuoc lau chua rua.", category: "UTILITIES", priority: "HIGH" },
  { title: "Dong ho dien chay nhanh bat thuong", description: "Tien dien thang nay tang 40% du khong tang thiet bi. Nghi dong ho dien bi loi.", category: "UTILITIES", priority: "MEDIUM" },

  // SECURITY (5)
  { title: "Cua chinh khong khoa duoc ban dem", description: "Cua ra vao chinh toa nha khong tu dong khoa sau 22h. Co nguoi la di vao khuon vien.", category: "SECURITY", priority: "URGENT" },
  { title: "Camera an ninh bi hong", description: "Camera goc cau thang tang 1 bi mat tin hieu tu tuan truoc. Can sua gap de dam bao an ninh.", category: "SECURITY", priority: "HIGH" },
  { title: "Mat trom xe dap", description: "Xe dap de ngoai san bi mat toi hom qua. Khu vuc nay khong co camera va thieu anh sang.", category: "SECURITY", priority: "URGENT" },
  { title: "Khoa cua phong bi ket", description: "Khoa cua phong bi ket khi xoay nguoc chieu. Phai dung luc manh moi mo duoc.", category: "SECURITY", priority: "MEDIUM" },
  { title: "Nguoi la vao ban dem", description: "2 dem lien co nguoi la di vao khu vuc de xe luc 2-3h sang. De nghi kiem tra camera.", category: "SECURITY", priority: "URGENT" },

  // CLEANLINESS (6)
  { title: "Cau thang nhieu rac", description: "Khu vuc cau thang co nhieu rac (bich mi, giay), khong duoc don dep thuong xuyen.", category: "CLEANLINESS", priority: "MEDIUM" },
  { title: "Nha ve sinh chung ban", description: "Nha ve sinh chung tang 1 ban, co mui hoi. Can tang lich ve sinh len 2 lan/ngay.", category: "CLEANLINESS", priority: "HIGH" },
  { title: "Kien va gian xuat hien nhieu", description: "Phong xuat hien nhieu kien den va gian. Nghi do ke tam ben bep khong kin.", category: "CLEANLINESS", priority: "LOW" },
  { title: "Rac truoc cong khong duoc don", description: "Rac truoc cong tro thuong bi de tu toi hom truoc, sang hom sau moi don. Boc mui kho chiu.", category: "CLEANLINESS", priority: "MEDIUM" },
  { title: "Cong thoat nuoc bi nghet", description: "Cong thoat nuoc truoc phong bi nghet, nuoc dang len moi khi mua. Muoi va ruoi nhieu.", category: "CLEANLINESS", priority: "HIGH" },
  { title: "Hanh lang bi doi nuoc mua", description: "Hanh lang tang 3 bi doi nuoc mua do mai ton bi ho. San uot tron, de bi truot.", category: "CLEANLINESS", priority: "HIGH" },
];

// Resolution templates for RESOLVED/CLOSED feedbacks
export const RESOLUTION_TEMPLATES = [
  "Da sua xong, kiem tra va xac nhan hoat dong binh thuong.",
  "Da thay moi linh kien. Bao hanh 3 thang.",
  "Da goi tho chuyen nghiep xu ly. Hien trang thai on dinh.",
  "Da nhac nho cac phong lien quan. Theo doi 2 tuan.",
  "Da don dep va ve sinh sach se. Tang lich don dep.",
  "Da kiem tra va khac phuc. Hen lich bao tri dinh ky.",
  "Da lien he nha cung cap sua chua. Van de da duoc giai quyet.",
  "Da lap dat thiet bi moi thay the. Hoat dong tot.",
  "Da phat hien nguyen nhan va xu ly triet de.",
  "Da bao tri toan bo he thong. Tinh trang cai thien ro ret.",
];
