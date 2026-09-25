export interface Treatment {
  name: string;
  duration: number; // in minutes
  trialPrice: number; // HKD
  originalPrice: number; // HKD
}

export interface Review {
  id: string;
  user: string;
  role: "Member" | "Blogger";
  skin: string; // e.g. "混乾敏感肌 · 25-30歲"
  date: string;
  star: number;
  pushLevel: number; // 1 to 5
  pricing: "100% 單次收費" | "購買了療程套票";
  text: string;
  verified: boolean;
  receiptUrl?: string;
  reply: string | null;
}

export interface Merchant {
  id: string;
  name: string;
  district: string;
  address: string;
  category: "全部" | "單次 Facial 保濕" | "輕醫美 PICO 皮秒" | "日韓美甲美睫" | "養生 Head Spa / 按摩" | "男士理容";
  rating: number;
  zeroHardSellIndex: number; // out of 5
  badges: string[];
  treatments: Treatment[];
  reviews: Review[];
  whatsappClickCount: number;
}

export interface ReceiptQueueItem {
  id: string;
  reviewId: string;
  userName: string;
  merchantName: string;
  amount: number;
  receiptMockName: string;
  status: "Pending" | "Approved" | "Rejected";
}

export const INITIAL_MERCHANTS: Merchant[] = [
  {
    id: "m-1",
    name: "Bare Skin Studio",
    district: "銅鑼灣",
    address: "銅鑼灣金朝陽中心二期 22 樓 A 室 (地鐵站 A 出口步行 2 分鐘)",
    category: "單次 Facial 保濕",
    rating: 4.9,
    zeroHardSellIndex: 5.0,
    badges: ["100% 單次收費", "無顧問全治療師主理", "獨立單人房", "提供男士預約"],
    treatments: [
      { name: "深層毛孔注氧修護", duration: 60, trialPrice: 280, originalPrice: 480 },
      { name: "膠原極緻飽滿水光導入", duration: 75, trialPrice: 420, originalPrice: 780 },
    ],
    whatsappClickCount: 142,
    reviews: [
      {
        id: "rev-1",
        user: "Chloe Chan",
        role: "Blogger",
        skin: "混乾敏感肌 · 25-30歲",
        date: "2026年9月",
        star: 5,
        pushLevel: 1,
        pricing: "100% 單次收費",
        text: "真係完全零推銷！入到去環境好乾淨，香薰味好放鬆。做Facial其間治療師好安靜，淨係喺針清嗰時溫柔提醒我有少少痛。做完之後直接喺梳妝枱飲茶，完全冇顧問房，亦都冇逼我買任何 package，極度推薦！",
        verified: true,
        receiptUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop", // placeholder representation for mock receipt
        reply: "多謝 Chloe 嘅支持！我哋一直堅持「單次收費、零硬銷」嘅理念，希望每一位客人嚟到都可以真正放鬆享受療程。期待下次再見到你！",
      },
      {
        id: "rev-2",
        user: "Yan Lau",
        role: "Member",
        skin: "暗瘡油肌 · 22-25歲",
        date: "2026年8月",
        star: 5,
        pushLevel: 2,
        pricing: "100% 單次收費",
        text: "針清手勢好溫柔，做完塊臉紅印好少，第二日就消曬。做完後治療師有禮貌咁提過一次話而家做緊首試優惠，如果下次想再做可以直接喺網上約，完全冇施壓！好舒服！",
        verified: true,
        receiptUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop",
        reply: null,
      }
    ]
  },
  {
    id: "m-2",
    name: "Aqua Medical Clinic 輕醫美",
    district: "旺角",
    address: "旺角雅蘭中心一期 18 樓 1802 室 (地鐵站 E1 出口直達)",
    category: "輕醫美 PICO 皮秒",
    rating: 4.7,
    zeroHardSellIndex: 4.6,
    badges: ["正廠正貨美國原廠儀器", "註冊醫生諮詢", "獨立VIP房"],
    treatments: [
      { name: "美國皮秒蜂巢激光全面嫩膚", duration: 45, trialPrice: 580, originalPrice: 1280 },
      { name: "HIFU 超聲刀緊緻提拉", duration: 90, trialPrice: 1680, originalPrice: 3200 },
    ],
    whatsappClickCount: 98,
    reviews: [
      {
        id: "rev-3",
        user: "Katy Ho",
        role: "Member",
        skin: "成熟抗衰老 · 35-40歲",
        date: "2026年9月",
        star: 4.5,
        pushLevel: 3,
        pricing: "購買了療程套票",
        text: "做皮秒效果真係好顯著，雀斑淡咗好多。諮詢嘅時候顧問有介紹套票，不過我話想考慮下先，佢地都冇黑面，態度依然好好。手勢專業，有醫生監測令人放心。",
        verified: true,
        receiptUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop",
        reply: null,
      }
    ]
  },
  {
    id: "m-3",
    name: "The Chill Head & Nail 養生美甲",
    district: "尖沙咀",
    address: "尖沙咀海防道 35-37 號海防大廈 5 樓 (地鐵站 A1 出口步行 1 分鐘)",
    category: "日韓美甲美睫",
    rating: 4.8,
    zeroHardSellIndex: 4.9,
    badges: ["明碼實價包拆甲", "獨立按摩躺椅", "環保無毒孕婦可用"],
    treatments: [
      { name: "日式單色透亮 Gel 甲 (包修死皮建構)", duration: 60, trialPrice: 320, originalPrice: 320 },
      { name: "越式草本頭療深層舒壓", duration: 75, trialPrice: 480, originalPrice: 680 },
    ],
    whatsappClickCount: 115,
    reviews: [
      {
        id: "rev-4",
        user: "Suki Wong",
        role: "Blogger",
        skin: "乾性頭皮 · 28-32歲",
        date: "2026年8月",
        star: 5,
        pushLevel: 1,
        pricing: "100% 單次收費",
        text: "頭療洗頭手勢超舒服，流水聲同精油令我差啲瞓著咗！吹乾頭髮之後仲有熱茶同小茶點。做Nail嘅師傅畫花好細緻，明碼實價，絕對冇任何隱形消費！",
        verified: true,
        receiptUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop",
        reply: "感謝 Suki 嘅好評！我哋好注重衛生同服務細節，好高興你能享受我哋嘅草本頭療同美甲服務。隨時歡迎你再嚟放鬆！",
      }
    ]
  },
  {
    id: "m-4",
    name: "Gentle Glow 男士理容美肌所",
    district: "中環",
    address: "中環威靈頓街 98 號高威大廈 8 樓 B 室 (中環街市旁)",
    category: "男士理容",
    rating: 4.6,
    zeroHardSellIndex: 4.8,
    badges: ["全男士獨立單間", "私隱度極高", "男士專研控油暗瘡"],
    treatments: [
      { name: "男士無痛針清控油淨肌護理", duration: 75, trialPrice: 450, originalPrice: 680 },
      { name: "男士防脫生髮頭皮淨化", duration: 60, trialPrice: 380, originalPrice: 580 },
    ],
    whatsappClickCount: 76,
    reviews: [
      {
        id: "rev-5",
        user: "Marcus Ip",
        role: "Member",
        skin: "油性混合肌 · 25-30歲",
        date: "2026年9月",
        star: 4.5,
        pushLevel: 2,
        pricing: "100% 單次收費",
        text: "中環少有專做男士Facial嘅，成個環境好Men好型，唔會好尷尬。針清一啲都唔痛，清得好乾淨。做完之後治療師寫咗張護膚建議卡俾我，提我平時點控油，完全冇推銷我買療程，好滿意！",
        verified: true,
        receiptUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop",
        reply: "多謝 Marcus！男士護膚最緊要係清爽同持之以恆，我哋嘅治療師好高興能夠幫到你。祝你皮膚愈嚟愈健康！",
      }
    ]
  }
];

export const INITIAL_RECEIPT_QUEUE: ReceiptQueueItem[] = [
  {
    id: "rq-1",
    reviewId: "pending-1",
    userName: "Tiffany Wong",
    merchantName: "Bare Skin Studio",
    amount: 280,
    receiptMockName: "BARE_SKIN_INV_90821.png",
    status: "Pending"
  },
  {
    id: "rq-2",
    reviewId: "pending-2",
    userName: "Vincent Cheung",
    merchantName: "Aqua Medical Clinic 輕醫美",
    amount: 1680,
    receiptMockName: "AQUA_CLINIC_HK_44321.png",
    status: "Pending"
  }
];

export const DISTRICT_OPTIONS = ["全部地區", "銅鑼灣", "旺角", "尖沙咀", "中環", "觀塘", "荃灣", "元朗", "沙田"];

export type UserRole = "Visitor" | "Member" | "Blogger" | "Merchant" | "Admin";
