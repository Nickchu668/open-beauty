import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  ShieldCheck, 
  Search, 
  Filter, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight, 
  Calendar, 
  Upload, 
  Send, 
  Heart, 
  User, 
  Clock, 
  DollarSign, 
  MapPin, 
  Check, 
  X, 
  ArrowRight,
  ThumbsUp,
  FileText,
  Briefcase,
  SlidersHorizontal,
  FileCheck
} from "lucide-react";
import { 
  INITIAL_MERCHANTS, 
  INITIAL_RECEIPT_QUEUE, 
  DISTRICT_OPTIONS, 
  Merchant, 
  Review, 
  Treatment, 
  ReceiptQueueItem, 
  UserRole 
} from "./data/mockData";

export default function App() {
  // Application State
  const [merchants, setMerchants] = useState<Merchant[]>(INITIAL_MERCHANTS);
  const [receiptQueue, setReceiptQueue] = useState<ReceiptQueueItem[]>(INITIAL_RECEIPT_QUEUE);
  const [currentRole, setCurrentRole] = useState<UserRole>("Member");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  
  // Filtering & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("全部地區");
  const [filterZeroHardSell, setFilterZeroHardSell] = useState(false);
  const [filterSingleSession, setFilterSingleSession] = useState(false);
  const [filterReceiptVerified, setFilterReceiptVerified] = useState(false);

  // Modals & Details State
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"info" | "pricing" | "reviews">("info");
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isReceiptZoomOpen, setIsReceiptZoomOpen] = useState(false);
  const [receiptZoomUrl, setReceiptZoomUrl] = useState<string | null>(null);
  const [targetBookingTreatment, setTargetBookingTreatment] = useState<{ merchantName: string, treatment: Treatment } | null>(null);

  // Review form state
  const [reviewMerchantId, setReviewMerchantId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewPushLevel, setReviewPushLevel] = useState(1);
  const [reviewPricingMode, setReviewPricingMode] = useState<"100% 單次收費" | "購買了療程套票">("100% 單次收費");
  const [reviewText, setReviewText] = useState("");
  const [reviewSkin, setReviewSkin] = useState("混乾敏感肌 · 25-30歲");
  const [uploadedReceiptName, setUploadedReceiptName] = useState<string | null>(null);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState("");

  // Merchant Portal edit pricing state
  const [editingMerchantId, setEditingMerchantId] = useState<string | null>(null);
  const [newTreatmentName, setNewTreatmentName] = useState("");
  const [newTreatmentDuration, setNewTreatmentDuration] = useState(60);
  const [newTreatmentTrial, setNewTreatmentTrial] = useState(299);
  const [newTreatmentOriginal, setNewTreatmentOriginal] = useState(499);

  // Merchant feedback reply input
  const [merchantReplyTexts, setMerchantReplyTexts] = useState<{ [reviewId: string]: string }>({});

  // Favorites state for current user
  const [favorites, setFavorites] = useState<string[]>(["m-1"]);

  // Banner announcement state
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  // Dynamic alerts list for hard sellers (push level >= 4)
  const getMerchantAveragePushLevel = (m: Merchant) => {
    if (m.reviews.length === 0) return 1;
    const sum = m.reviews.reduce((acc, rev) => acc + rev.pushLevel, 0);
    return sum / m.reviews.length;
  };

  // Switch role helper
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    // If merchant role, auto set editing merchant for convenient demo
    if (role === "Merchant") {
      setEditingMerchantId("m-1");
    } else {
      setEditingMerchantId(null);
    }
  };

  // Toggle favorite
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentRole === "Visitor") {
      alert("請切換為「認證會員」或「達人」以收藏您心儀的商戶！");
      return;
    }
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Filter merchants based on UI selections
  const filteredMerchants = useMemo(() => {
    return merchants.filter(m => {
      // Category filter
      if (selectedCategory !== "全部" && m.category !== selectedCategory) {
        return false;
      }
      // District filter
      if (selectedDistrict !== "全部地區" && m.district !== selectedDistrict) {
        return false;
      }
      // Text search
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(query);
        const matchesAddress = m.address.toLowerCase().includes(query);
        const matchesTreatments = m.treatments.some(t => t.name.toLowerCase().includes(query));
        const matchesBadges = m.badges.some(b => b.toLowerCase().includes(query));
        if (!matchesName && !matchesAddress && !matchesTreatments && !matchesBadges) {
          return false;
        }
      }
      // Toggles
      if (filterZeroHardSell && m.zeroHardSellIndex < 4.5) {
        return false;
      }
      if (filterSingleSession && !m.badges.includes("100% 單次收費")) {
        return false;
      }
      if (filterReceiptVerified && !m.reviews.some(r => r.verified)) {
        return false;
      }
      return true;
    });
  }, [merchants, selectedCategory, selectedDistrict, searchQuery, filterZeroHardSell, filterSingleSession, filterReceiptVerified]);

  // Open WhatsApp reservation modal
  const handleWhatsAppTrigger = (merchant: Merchant, treatment: Treatment, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetBookingTreatment({ merchantName: merchant.name, treatment });
    setIsWhatsAppOpen(true);

    // Track statistics: increment count
    setMerchants(prev => prev.map(m => {
      if (m.id === merchant.id) {
        return { ...m, whatsappClickCount: m.whatsappClickCount + 1 };
      }
      return m;
    }));
  };

  // Finalize booking simulator
  const handleWhatsAppConfirmed = () => {
    setIsWhatsAppOpen(false);
    alert("已模擬啟動 WhatsApp 並發送預約訊息！");
  };

  // Submit Review Handler
  const handleWriteReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewMerchantId) {
      alert("請選擇美容院商戶！");
      return;
    }

    const reviewId = `new-rev-${Date.now()}`;
    const newReview: Review = {
      id: reviewId,
      user: currentRole === "Blogger" ? "星級美業 Blogger (真實探店)" : "實名消費會員",
      role: currentRole === "Blogger" ? "Blogger" : "Member",
      skin: reviewSkin,
      date: "剛剛",
      star: reviewRating,
      pushLevel: reviewPushLevel,
      pricing: reviewPricingMode,
      text: reviewText,
      verified: uploadedReceiptName ? false : false, // False until approved by Admin backoffice
      reply: null,
      receiptUrl: uploadedReceiptName ? "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop" : undefined
    };

    // Update merchants reviews
    setMerchants(prev => prev.map(m => {
      if (m.id === reviewMerchantId) {
        const updatedReviews = [newReview, ...m.reviews];
        // Recalculate average star rating
        const totalStars = updatedReviews.reduce((sum, r) => sum + r.star, 0);
        const avgStar = parseFloat((totalStars / updatedReviews.length).toFixed(1));
        
        // Recalculate Zero-pressure Score
        // Formula: 5.0 - (average push level - 1) * 0.8 (bounded between 1.0 and 5.0)
        const totalPush = updatedReviews.reduce((sum, r) => sum + r.pushLevel, 0);
        const avgPush = totalPush / updatedReviews.length;
        const zeroIndex = parseFloat(Math.max(1.0, Math.min(5.0, 5.0 - (avgPush - 1) * 0.8)).toFixed(1));

        return {
          ...m,
          reviews: updatedReviews,
          rating: avgStar,
          zeroHardSellIndex: zeroIndex
        };
      }
      return m;
    }));

    // If receipt uploaded, push into Admin Queue
    if (uploadedReceiptName) {
      const selectedMerchantObj = merchants.find(m => m.id === reviewMerchantId);
      const newQueueItem: ReceiptQueueItem = {
        id: `rq-${Date.now()}`,
        reviewId: reviewId,
        userName: currentRole === "Blogger" ? "Blogger 達人" : "一般會員",
        merchantName: selectedMerchantObj?.name || "未知商戶",
        amount: reviewPricingMode === "100% 單次收費" ? 380 : 1500, // mock amounts
        receiptMockName: uploadedReceiptName,
        status: "Pending"
      };
      setReceiptQueue(prev => [newQueueItem, ...prev]);
    }

    setReviewSuccessMessage("您的真實點評已成功遞交！" + (uploadedReceiptName ? "【消費單據】已送往超級管理員審核，核實後將會亮起黃金認證徽章！" : ""));
    
    // Reset Form
    setReviewText("");
    setUploadedReceiptName(null);
    setTimeout(() => {
      setIsWriteReviewOpen(false);
      setReviewSuccessMessage("");
    }, 4000);
  };

  // Admin approves receipt
  const handleApproveReceipt = (item: ReceiptQueueItem) => {
    // 1. Set receipt queue status
    setReceiptQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: "Approved" as const } : q));
    
    // 2. Mark the review as verified in merchants state
    setMerchants(prev => prev.map(m => {
      const hasReview = m.reviews.some(r => r.id === item.reviewId);
      if (hasReview) {
        const updatedReviews = m.reviews.map(r => r.id === item.reviewId ? { ...r, verified: true } : r);
        return { ...m, reviews: updatedReviews };
      }
      return m;
    }));

    alert(`已核實 ${item.userName} 於 ${item.merchantName} 嘅單據，評級已升級為「🧾 已驗證消費單據」！`);
  };

  // Admin rejects receipt
  const handleRejectReceipt = (item: ReceiptQueueItem) => {
    setReceiptQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: "Rejected" as const } : q));
    alert(`已駁回單據審核申請。`);
  };

  // Merchant adds Treatment
  const handleAddTreatment = (merchantId: string) => {
    if (!newTreatmentName.trim()) {
      alert("請輸入療程名稱！");
      return;
    }
    const newT: Treatment = {
      name: newTreatmentName,
      duration: newTreatmentDuration,
      trialPrice: newTreatmentTrial,
      originalPrice: newTreatmentOriginal
    };

    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        return {
          ...m,
          treatments: [...m.treatments, newT]
        };
      }
      return m;
    }));

    setNewTreatmentName("");
    alert("全新療程已上架！");
  };

  // Merchant Official Reply
  const handleMerchantReplySubmit = (merchantId: string, reviewId: string) => {
    const replyText = merchantReplyTexts[reviewId];
    if (!replyText || !replyText.trim()) {
      alert("請輸入回覆內容！");
      return;
    }

    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        const updatedReviews = m.reviews.map(r => {
          if (r.id === reviewId) {
            return { ...r, reply: replyText };
          }
          return r;
        });
        return { ...m, reviews: updatedReviews };
      }
      return m;
    }));

    // Reset reply text
    setMerchantReplyTexts(prev => ({ ...prev, [reviewId]: "" }));
    alert("官方答辯回覆已成功發佈！已同步顯示至點評區。");
  };

  // Slider level formatter help text
  const getSliderHelpText = (level: number) => {
    switch (level) {
      case 1: return "Level 1: 全程安睡零推銷 😴 (全程不發一言，極致享受)";
      case 2: return "Level 2: 禮貌提及無壓力 🍵 (療程前後簡單帶過，絕不追問)";
      case 3: return "Level 3: 稍有提及隨即停止 ✋ (客氣詢問，拒絕後沒有絲毫黑面)";
      case 4: return "Level 4: 輕度施壓反復詢問 😣 (治療師/顧問推銷數次，略帶不適)";
      case 5: return "Level 5: 困入顧問房嚴重硬銷 🚨 (扣留信用卡，集體施壓逼買套票)";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAF7F5] selection:bg-[#C2847A]/30 selection:text-[#2D2625]">
      
      {/* Top Bar Navigation (3 Zones) - Now top-0 with integrated role selector */}
      <header className="bg-white border-b border-rose-100/50 px-6 py-4 sticky top-0 z-40 shadow-[0_2px_15px_rgb(220,180,180,0.03)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Zone 1: Brand Wordmark and Sparkle */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#C2847A]/10 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-[#C2847A]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl md:text-2xl font-bold tracking-wider text-[#2D2625]">
                  OPEN BEAUTY
                </span>
                <span className="font-sans text-xl md:text-2xl font-semibold text-[#C2847A]">美站</span>
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-[10px] text-stone-400 tracking-widest uppercase">Hong Kong Honest Beauty Guide</p>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#786F6D]">
            <a href="#directory" className="hover:text-[#C2847A] transition-colors">熱門美業地圖</a>
            <a href="#trust" className="hover:text-[#C2847A] transition-colors flex items-center gap-1">
              <span>單次收費保證</span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded border border-emerald-100">堅拒硬銷</span>
            </a>
            <a href="#blogger-zone" className="hover:text-[#C2847A] transition-colors">達人探店專欄</a>
            <a href="#anti-hard-sell" className="hover:text-[#C2847A] transition-colors text-rose-700 font-semibold">黑店/強制逼單預警</a>
          </nav>

          {/* Zone 3: Navigation Actions & Persona Switcher */}
          <div className="flex items-center gap-3">
            {/* Elegant Inline Persona Dropdown Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 bg-[#FAF7F5] border border-rose-100 hover:bg-stone-100/80 text-stone-700 text-xs md:text-sm px-4 py-2.5 rounded-full transition-all font-medium cursor-pointer shadow-xs"
              >
                <User className="w-4 h-4 text-[#C2847A]" />
                <span className="hidden sm:inline text-[#786F6D]">身分:</span>
                <span className="font-semibold text-[#2D2625]">
                  {currentRole === "Visitor" && "訪客 👤"}
                  {currentRole === "Member" && "會員 🧾"}
                  {currentRole === "Blogger" && "達人 👑"}
                  {currentRole === "Merchant" && "商戶 🏢"}
                  {currentRole === "Admin" && "管理 🛡️"}
                </span>
              </button>
              
              {isRoleDropdownOpen && (
                <>
                  {/* Dropdown Backdrop to close on tap */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsRoleDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-rose-100 rounded-2xl shadow-xl py-2.5 z-50 animate-in fade-in slide-in-from-top-5 duration-150">
                    <div className="px-4 py-1 text-[10px] uppercase font-bold text-[#C2847A] border-b border-stone-100 pb-1.5 mb-1.5">
                      測試身份切換器
                    </div>
                    {[
                      { key: "Visitor", label: "訪客 👤", desc: "僅瀏覽店鋪與預約" },
                      { key: "Member", label: "會員 🧾", desc: "發表實名點評與上傳單據" },
                      { key: "Blogger", label: "達人 👑", desc: "官方認證星級 Blogger 標記" },
                      { key: "Merchant", label: "商戶 🏢", desc: "管理療程價格、回覆顧客" },
                      { key: "Admin", label: "管理 🛡️", desc: "實時核實單據與硬銷預警" }
                    ].map((roleItem) => (
                      <button
                        key={roleItem.key}
                        type="button"
                        onClick={() => {
                          handleRoleChange(roleItem.key as UserRole);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs hover:bg-[#FAF7F5] transition-colors flex flex-col gap-0.5 cursor-pointer ${currentRole === roleItem.key ? "bg-[#C2847A]/5 font-semibold text-[#A74E52]" : "text-stone-700"}`}
                      >
                        <span>{roleItem.label}</span>
                        <span className="text-[9px] text-stone-400 font-normal leading-normal">{roleItem.desc}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={() => {
                if (currentRole === "Visitor") {
                  alert("訪客無法發表點評。請點擊頂部「身分」選單切換為「會員」或「達人」！");
                } else {
                  setReviewMerchantId(merchants[0].id);
                  setIsWriteReviewOpen(true);
                }
              }}
              className="flex items-center gap-2 bg-[#C2847A] hover:bg-[#A74E52] text-white text-xs md:text-sm px-4.5 py-2.5 rounded-full transition-all duration-300 font-medium shadow-md shadow-[#C2847A]/10 whitespace-nowrap cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>發表實名點評</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-b from-[#FAF7F5] via-white to-[#FAF7F5]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C2847A]/5 border border-rose-100 rounded-full text-xs text-[#A74E52] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C2847A]" />
              <span>100% 實名單據驗證 ． 香港美容界公平點評指南</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-semibold text-[#2D2625] leading-tight text-wrap">
              告別黑店與硬銷<br />
              <span className="text-[#C2847A] italic">明碼實價</span> 體驗舒適香港美業
            </h1>

            <p className="text-[#786F6D] text-sm md:text-base max-w-xl leading-relaxed">
              OPEN BEAUTY 美站是香港首個倡導「零推銷、單次收費」的醫美與美容院點評平台。我們以真實消費收據核實每一筆評價，將無顧問房、不設硬銷套票、透明收費的優質沙龍呈現眼前。
            </p>

            {/* Quick search input */}
            <div className="relative max-w-xl bg-white rounded-2xl shadow-lg border border-rose-100/60 p-1.5 flex items-center">
              <div className="flex items-center gap-2 pl-3 flex-1">
                <Search className="w-5 h-5 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="搜尋商戶名稱、商業大廈 (如：金朝陽、雅蘭)、療程或儀器..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm text-[#2D2625] placeholder-stone-400 focus:outline-none bg-transparent"
                />
              </div>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-stone-400 hover:text-stone-600 mr-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={() => {
                  const element = document.getElementById("directory");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-[#C2847A] hover:bg-[#A74E52] text-white text-xs px-5 py-3 rounded-xl transition-all font-medium cursor-pointer"
              >
                搜尋
              </button>
            </div>

            {/* Core Pillars (Claim-to-proof) */}
            <div className="grid grid-cols-3 gap-4 pt-4 text-xs">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#2D2625]">100% 單次收費</h4>
                  <p className="text-stone-400">告別無限期過萬元套票</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#2D2625]">獨創推銷指數</h4>
                  <p className="text-stone-400">評測是否有顧問房疲勞轟炸</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#2D2625]">單據認證點評</h4>
                  <p className="text-stone-400">打擊 KOL 假代言與打手評論</p>
                </div>
              </div>
            </div>

          </div>

          {/* Banner right side graphic - Aesthetic French Spa interior card */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-tr from-[#FAF0ED] via-[#FAF7F5] to-rose-50 border border-rose-100/50 p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 rounded-full blur-2xl"></div>
              
              <div className="space-y-4 relative z-10">
                <span className="text-[10px] uppercase tracking-widest text-[#C2847A] font-semibold">Open Beauty Certified</span>
                <h3 className="font-serif text-2xl text-[#2D2625] font-semibold">零壓美業倡議</h3>
                <p className="text-stone-500 text-xs leading-relaxed">
                  「我哋承諾：療程價格明碼實價，無任何附加隱藏收費。療程期間不進行任何高壓推銷，讓客人擁有完全的自主決定權。」
                </p>
              </div>

              <div className="space-y-3 relative z-10 pt-4 border-t border-rose-100/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">香港加盟店鋪</span>
                  <span className="font-semibold text-[#2D2625]">84 間持續增加</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">已審核消費單據金額</span>
                  <span className="font-semibold text-emerald-700">HK$1,482,900+</span>
                </div>
              </div>
              
            </div>
          </div>

        </div>
      </section>

      {/* Directory Filter & Search Map Container */}
      <main id="directory" className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        
        {/* Dynamic Category Selector Bar */}
        <div className="flex items-center justify-between border-b border-rose-100/40 pb-4">
          <h2 className="font-serif text-2xl font-bold text-[#2D2625] flex items-center gap-2">
            <span>探索嚴選美業</span>
            <span className="text-xs font-sans font-normal text-stone-400 bg-stone-100 px-2.5 py-0.5 rounded-full">
              找到 {filteredMerchants.length} 間商戶
            </span>
          </h2>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400 hidden sm:inline">地區搜尋:</span>
            <select 
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-white border border-rose-100/80 rounded-xl px-3 py-1.5 text-xs text-[#2D2625] focus:outline-none focus:border-[#C2847A]"
            >
              {DISTRICT_OPTIONS.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pill Buttons */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {["全部", "單次 Facial 保濕", "輕醫美 PICO 皮秒", "日韓美甲美睫", "養生 Head Spa / 按摩", "男士理容"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-medium rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? "bg-[#C2847A] text-white shadow-md shadow-[#C2847A]/15" 
                  : "bg-white text-stone-600 hover:bg-[#FAF7F5] border border-stone-200/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Special Anti-Hard Sell Filters Panel */}
        <div className="bg-white rounded-2xl p-4 border border-rose-100/60 shadow-[0_4px_20px_rgb(220,180,180,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-xs font-semibold text-[#786F6D] flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-[#C2847A]" />
              <span>安全篩選器：</span>
            </span>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
              <input 
                type="checkbox" 
                checked={filterZeroHardSell}
                onChange={(e) => setFilterZeroHardSell(e.target.checked)}
                className="rounded text-[#C2847A] focus:ring-[#C2847A] w-4 h-4 accent-[#C2847A]"
              />
              <span className="flex items-center gap-1">
                <span>🛡️ 零推銷優先</span>
                <span className="text-[10px] text-stone-400">(指數 4.5 以上)</span>
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
              <input 
                type="checkbox" 
                checked={filterSingleSession}
                onChange={(e) => setFilterSingleSession(e.target.checked)}
                className="rounded text-[#C2847A] focus:ring-[#C2847A] w-4 h-4 accent-[#C2847A]"
              />
              <span className="flex items-center gap-1">
                <span>💰 100% 純單次收費</span>
                <span className="text-[10px] text-stone-400">(絕無套票)</span>
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
              <input 
                type="checkbox" 
                checked={filterReceiptVerified}
                onChange={(e) => setFilterReceiptVerified(e.target.checked)}
                className="rounded text-[#C2847A] focus:ring-[#C2847A] w-4 h-4 accent-[#C2847A]"
              />
              <span className="flex items-center gap-1">
                <span>🧾 必須附消費單據點評</span>
              </span>
            </label>
          </div>

          {(filterZeroHardSell || filterSingleSession || filterReceiptVerified || searchQuery || selectedDistrict !== "全部地區" || selectedCategory !== "全部") && (
            <button 
              onClick={() => {
                setFilterZeroHardSell(false);
                setFilterSingleSession(false);
                setFilterReceiptVerified(false);
                setSearchQuery("");
                setSelectedDistrict("全部地區");
                setSelectedCategory("全部");
              }}
              className="text-xs text-[#A74E52] hover:underline font-medium cursor-pointer"
            >
              重置所有篩選
            </button>
          )}

        </div>

        {/* Merchants Directory Grid */}
        {filteredMerchants.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-rose-100/50">
            <AlertTriangle className="w-12 h-12 text-[#C2847A] mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold text-[#2D2625] mb-2">未找到符合條件的香港商戶</h3>
            <p className="text-stone-400 text-sm max-w-md mx-auto">
              試試放寬篩選條件，或輸入其他關鍵字搜尋。OPEN BEAUTY 將持續為您開拓更多單次收費、保證不硬銷的美業！
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredMerchants.map((merchant) => {
              const avgPush = getMerchantAveragePushLevel(merchant);
              const isHighPushRisk = avgPush >= 3.8;

              return (
                <div 
                  key={merchant.id}
                  onClick={() => {
                    setSelectedMerchant(merchant);
                    setActiveModalTab("info");
                  }}
                  className="bg-white rounded-2xl border border-rose-100/60 hover:border-[#C2847A]/30 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between group shadow-[0_10px_35px_rgb(220,180,180,0.03)]"
                >
                  
                  {/* Top image wrapper & Badge overlay */}
                  <div className="relative h-44 bg-gradient-to-tr from-[#FAF0ED] to-rose-100/50 flex flex-col justify-between p-5">
                    
                    {/* Role specific quick action overlay inside card */}
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-wrap gap-1">
                        {merchant.badges.map((badge, idx) => (
                          <span 
                            key={idx}
                            className={`text-[10px] px-2.5 py-1 rounded-md border font-medium ${
                              badge === "100% 單次收費" 
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                                : badge === "明碼實價包拆甲"
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : "bg-purple-50 text-purple-800 border-purple-200"
                            }`}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>

                      {/* Favorite Icon */}
                      <button 
                        onClick={(e) => toggleFavorite(merchant.id, e)}
                        className="p-1.5 bg-white/80 rounded-full hover:bg-white text-[#C2847A] transition-all cursor-pointer shadow-sm"
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(merchant.id) ? "fill-[#C2847A]" : ""}`} />
                      </button>
                    </div>

                    {/* Hard sell emergency alert banner if push score is high */}
                    {isHighPushRisk ? (
                      <div className="bg-red-50 text-red-800 border border-red-200 rounded-lg p-2 text-[11px] flex items-center gap-1.5 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-700 shrink-0" />
                        <span className="font-medium">系統警告：近期被投訴有一定推銷壓力，請小心！</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-stone-500 bg-white/70 backdrop-blur-xs py-1 px-2.5 rounded-lg text-[11px] self-start font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>經 OPEN BEAUTY 認證無套票陷阱</span>
                      </div>
                    )}

                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    
                    {/* Merchant Header */}
                    <div>
                      <div className="flex items-center gap-2 text-stone-400 text-xs mb-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{merchant.district}</span>
                        <span>·</span>
                        <span>{merchant.category}</span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-[#2D2625] group-hover:text-[#C2847A] transition-colors">
                        {merchant.name}
                      </h3>
                      <p className="text-stone-400 text-xs truncate mt-1">
                        {merchant.address}
                      </p>
                    </div>

                    {/* TWO UNIQUE METRIC CARDS */}
                    <div className="grid grid-cols-2 gap-3 bg-[#FAF7F5] p-3 rounded-xl border border-stone-100">
                      
                      {/* Metric 1: Star Rating */}
                      <div className="text-center md:text-left">
                        <span className="block text-[10px] text-stone-400 uppercase tracking-wider font-semibold">綜合滿意度</span>
                        <div className="flex items-center justify-center md:justify-start gap-1 mt-0.5">
                          <span className="text-lg font-bold text-[#2D2625]">{merchant.rating}</span>
                          <span className="text-amber-400 text-sm">★</span>
                          <span className="text-[10px] text-stone-400">({merchant.reviews.length}則點評)</span>
                        </div>
                      </div>

                      {/* Metric 2: Zero Pressure Score */}
                      <div className="text-center md:text-left border-l border-stone-200/60 pl-3">
                        <span className="block text-[10px] text-stone-400 uppercase tracking-wider font-semibold">零推銷指數</span>
                        <div className="flex items-center justify-center md:justify-start gap-1 mt-0.5">
                          <span className={`text-lg font-bold ${merchant.zeroHardSellIndex >= 4.5 ? "text-emerald-700" : "text-amber-700"}`}>
                            {merchant.zeroHardSellIndex.toFixed(1)}/5.0
                          </span>
                          <span className="text-[10px] text-stone-400 bg-emerald-50 text-emerald-800 px-1 rounded">
                            {merchant.zeroHardSellIndex >= 4.8 ? "極放鬆 😴" : merchant.zeroHardSellIndex >= 4.3 ? "無壓力 🍵" : "有推銷 😣"}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Zero hard sell progress bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                        <span>全程安睡無推銷</span>
                        <span>硬銷逼單</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            merchant.zeroHardSellIndex >= 4.7 
                              ? "bg-emerald-500" 
                              : merchant.zeroHardSellIndex >= 4.2 
                              ? "bg-amber-500" 
                              : "bg-red-500"
                          }`}
                          style={{ width: `${(merchant.zeroHardSellIndex / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Signature Treatment Price display */}
                    <div className="pt-3 border-t border-stone-100 space-y-2">
                      <span className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider block">推廣療程收費</span>
                      
                      {merchant.treatments.slice(0, 2).map((t, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1 hover:bg-[#FAF7F5] rounded px-1.5 transition-colors">
                          <span className="text-[#2D2625] font-medium max-w-[170px] truncate">{t.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-stone-400 line-through">HK${t.originalPrice}</span>
                            <span className="text-[#A74E52] font-semibold">HK${t.trialPrice}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Card Actions */}
                  <div className="px-6 pb-6 pt-2 flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMerchant(merchant);
                        setActiveModalTab("reviews");
                      }}
                      className="flex-1 border border-stone-200 hover:bg-stone-50 text-stone-700 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer text-center"
                    >
                      查看真實口碑 ({merchant.reviews.length})
                    </button>
                    
                    <button 
                      onClick={(e) => handleWhatsAppTrigger(merchant, merchant.treatments[0], e)}
                      className="flex-1 bg-[#C2847A] hover:bg-[#A74E52] text-white py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all hover:shadow-md cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>經 WhatsApp 預約</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Trust Guarantee Section */}
      <section id="trust" className="bg-[#FAF0ED] py-16 border-t border-rose-100/50 mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <h2 className="font-serif text-3xl font-bold text-[#2D2625]">OPEN BEAUTY 誠信點評機制</h2>
            <p className="text-stone-500 text-sm leading-relaxed">
              為根治香港美容界「KOL打手文」、「欺騙性套票銷控」、「黑店硬銷困房」等劣行，我們推行三項鐵腕標準：
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-rose-100/30 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-xl">
                🛡️
              </div>
              <h3 className="font-semibold text-lg text-[#2D2625]">消費單據審核制</h3>
              <p className="text-stone-400 text-xs leading-relaxed">
                普通會員上傳發票、收據或交易單據（系統自動打碼隱私），經管理員逐一審查，核實商戶、消費金額後，才會亮起「已驗證單據」金色點評皇冠，確保並非虛假打手。
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-rose-100/30 text-center space-y-3">
              <div className="w-12 h-12 bg-rose-50 text-[#C2847A] rounded-full flex items-center justify-center mx-auto text-xl">
                🍵
              </div>
              <h3 className="font-semibold text-lg text-[#2D2625]">零推銷指數 (Zero-Hard Sell)</h3>
              <p className="text-stone-400 text-xs leading-relaxed">
                將推銷程度科學量化為 1–5 星，清楚揭示商戶是否備有硬銷顧問、是否強硬拖延退款等。指數低於 4.0 的店鋪將自動標記「推銷預警」警告。
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-rose-100/30 text-center space-y-3">
              <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-full flex items-center justify-center mx-auto text-xl">
                🤝
              </div>
              <h3 className="font-semibold text-lg text-[#2D2625]">單次收費標籤</h3>
              <p className="text-stone-400 text-xs leading-relaxed">
                平台強制加盟商戶明碼實價標註「單次試做價」及「單次常規原價」，承諾即使不購買 package 亦能享受完全相同之專業手法與儀器，否則用戶可隨時舉報！
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Merchant Center Workspace Panel (Visible if role is Merchant) */}
      {currentRole === "Merchant" && (
        <section className="max-w-7xl mx-auto px-6 py-12 border-t-2 border-dashed border-[#C2847A]/30">
          <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-[#C2847A] space-y-8 shadow-lg">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-rose-100 pb-4">
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-[#C2847A]" />
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#2D2625]">Bare Skin Studio · 商戶管理中心</h2>
                  <p className="text-xs text-stone-400">您正以 Bare Skin Studio 官方代表身份管理店鋪（已驗證安全登入）</p>
                </div>
              </div>
              <span className="bg-[#C2847A] text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                官方合作商戶
              </span>
            </div>

            {/* Simulated Booking Performance Insights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#FAF7F5] p-4 rounded-xl border border-stone-200/50">
                <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">WhatsApp 點擊次數</span>
                <span className="text-2xl font-bold text-[#2D2625] block mt-1">142 次</span>
                <span className="text-[10px] text-emerald-600 font-medium">較上月增長 +12.4%</span>
              </div>
              <div className="bg-[#FAF7F5] p-4 rounded-xl border border-stone-200/50">
                <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">累計顧客諮詢數</span>
                <span className="text-2xl font-bold text-[#2D2625] block mt-1">88 次</span>
                <span className="text-[10px] text-stone-400">諮詢轉換率: 62%</span>
              </div>
              <div className="bg-[#FAF7F5] p-4 rounded-xl border border-stone-200/50">
                <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">顧客評分 (星級)</span>
                <span className="text-2xl font-bold text-amber-600 block mt-1">4.9 ★</span>
                <span className="text-[10px] text-stone-400">綜合評比全港 TOP 5%</span>
              </div>
              <div className="bg-[#FAF7F5] p-4 rounded-xl border border-stone-200/50">
                <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">零推銷指數</span>
                <span className="text-2xl font-bold text-emerald-700 block mt-1">5.0 / 5.0</span>
                <span className="text-[10px] text-emerald-600 font-medium">🏅 全程安睡完美指標</span>
              </div>
            </div>

            {/* Pricing list editor & Replies workflow */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Add/Edit treatments */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#2D2625] flex items-center gap-1.5 border-b border-stone-100 pb-2">
                  <span>🛠️ 更新店鋪療程與透明定價</span>
                </h3>

                <div className="space-y-3 bg-[#FAF7F5] p-4 rounded-xl border border-stone-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#786F6D] mb-1 font-semibold">療程名稱</label>
                      <input 
                        type="text" 
                        placeholder="例如: 深層水漾保濕"
                        value={newTreatmentName}
                        onChange={(e) => setNewTreatmentName(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#C2847A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#786F6D] mb-1 font-semibold">耗時 (分鐘)</label>
                      <input 
                        type="number" 
                        value={newTreatmentDuration}
                        onChange={(e) => setNewTreatmentDuration(parseInt(e.target.value) || 60)}
                        className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#786F6D] mb-1 font-semibold">首次試做價 (HKD)</label>
                      <input 
                        type="number" 
                        value={newTreatmentTrial}
                        onChange={(e) => setNewTreatmentTrial(parseInt(e.target.value) || 280)}
                        className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#786F6D] mb-1 font-semibold">單次常規原價 (HKD)</label>
                      <input 
                        type="number" 
                        value={newTreatmentOriginal}
                        onChange={(e) => setNewTreatmentOriginal(parseInt(e.target.value) || 480)}
                        className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAddTreatment("m-1")}
                    className="w-full bg-[#C2847A] hover:bg-[#A74E52] text-white text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    上架此療程 (承諾單次收費且不硬銷)
                  </button>
                </div>

                {/* Listing currently managed treatments */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-stone-500 block">目前上架療程：</span>
                  {merchants.find(m => m.id === "m-1")?.treatments.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2.5 bg-white border border-stone-100 rounded-lg shadow-sm">
                      <div className="font-semibold text-stone-700">{t.name} ({t.duration}分鐘)</div>
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400 line-through">HK${t.originalPrice}</span>
                        <span className="text-[#A74E52] font-semibold">首次 HK${t.trialPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Merchant replies database */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#2D2625] flex items-center gap-1.5 border-b border-stone-100 pb-2">
                  <span>💬 顧客真實點評申辯與官方回應</span>
                </h3>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {merchants.find(m => m.id === "m-1")?.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-white border border-stone-100 rounded-xl space-y-3 shadow-sm text-xs">
                      
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-700">{rev.user} ({rev.skin})</span>
                        <span className="text-amber-500 font-semibold">{rev.star} ★</span>
                      </div>

                      <p className="text-stone-500 italic">「 {rev.text} 」</p>

                      {rev.reply ? (
                        <div className="bg-[#FAF7F5] p-2.5 rounded border border-stone-200/50">
                          <span className="font-semibold text-[#C2847A] block mb-0.5">您的官方回覆：</span>
                          <p className="text-stone-600">{rev.reply}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <textarea 
                            placeholder="輸入您的官方專業回應，感謝支持或澄清事實（每條評論限回覆一次，不可刪除真實差評）..."
                            value={merchantReplyTexts[rev.id] || ""}
                            onChange={(e) => setMerchantReplyTexts({ ...merchantReplyTexts, [rev.id]: e.target.value })}
                            className="w-full bg-[#FAF7F5] border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#C2847A] min-h-[50px]"
                          ></textarea>
                          <button 
                            onClick={() => handleMerchantReplySubmit("m-1", rev.id)}
                            className="bg-stone-800 hover:bg-stone-900 text-white text-[10px] font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer"
                          >
                            提交官方回覆
                          </button>
                        </div>
                      )}

                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>
        </section>
      )}

      {/* Admin Backoffice Dashboard Container (Visible if role is Admin) */}
      {currentRole === "Admin" && (
        <section className="bg-stone-900 text-stone-200 py-12 border-t-4 border-[#C2847A] px-6">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-amber-500" />
                <div>
                  <h2 className="font-serif text-2xl font-bold tracking-wide">OPEN BEAUTY 實名消費單據審核與後台</h2>
                  <p className="text-xs text-stone-400">管理端控制台 ． 保證 100% 真實香港數據，嚴防商業打手與黑店刷評</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/15 text-amber-400 text-xs px-3 py-1 rounded border border-amber-500/30">
                  實時監控中
                </span>
              </div>
            </div>

            {/* Backoffice summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
                <span className="text-stone-500 text-[10px] uppercase font-bold block">待審核單據隊列</span>
                <span className="text-2xl font-bold text-amber-500 block mt-1">
                  {receiptQueue.filter(q => q.status === "Pending").length} 份
                </span>
              </div>
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
                <span className="text-stone-500 text-[10px] uppercase font-bold block">全港商戶入駐</span>
                <span className="text-2xl font-bold text-stone-200 block mt-1">84 家</span>
              </div>
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
                <span className="text-stone-500 text-[10px] uppercase font-bold block">累計已審核單據</span>
                <span className="text-2xl font-bold text-emerald-500 block mt-1">
                  {receiptQueue.filter(q => q.status === "Approved").length + 242} 份
                </span>
              </div>
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
                <span className="text-stone-500 text-[10px] uppercase font-bold block">硬銷預警警報</span>
                <span className="text-2xl font-bold text-red-500 block mt-1">0 家</span>
              </div>
            </div>

            {/* Receipt Verification Queue Table */}
            <div className="bg-stone-950 rounded-2xl border border-stone-800 p-6 space-y-4">
              <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-500" />
                <span>用戶上傳消費單據審核佇列 (Receipt Verification Queue)</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-500 font-semibold">
                      <th className="py-3 px-4">上傳者</th>
                      <th className="py-3 px-4">美容院 / 商戶</th>
                      <th className="py-3 px-4">消費療程金額</th>
                      <th className="py-3 px-4">單據檔名</th>
                      <th className="py-3 px-4">狀態</th>
                      <th className="py-3 px-4 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {receiptQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-900/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-stone-300">{item.userName}</td>
                        <td className="py-3 px-4 text-stone-300">{item.merchantName}</td>
                        <td className="py-3 px-4 text-emerald-400 font-mono">HK$ {item.amount}</td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => {
                              setReceiptZoomUrl("https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop");
                              setIsReceiptZoomOpen(true);
                            }}
                            className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{item.receiptMockName} (點擊預覽)</span>
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          {item.status === "Pending" && (
                            <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                              待審核
                            </span>
                          )}
                          {item.status === "Approved" && (
                            <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                              已批准核實
                            </span>
                          )}
                          {item.status === "Rejected" && (
                            <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 font-medium">
                              已駁回
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {item.status === "Pending" ? (
                            <>
                              <button 
                                onClick={() => handleApproveReceipt(item)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded transition-colors cursor-pointer"
                              >
                                批准通過
                              </button>
                              <button 
                                onClick={() => handleRejectReceipt(item)}
                                className="bg-red-900/60 hover:bg-red-900 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded transition-colors cursor-pointer"
                              >
                                駁回
                              </button>
                            </>
                          ) : (
                            <span className="text-stone-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[#2D2625] text-stone-400 py-12 px-6 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C2847A]" />
              <span className="font-serif text-lg font-bold tracking-wider text-white">OPEN BEAUTY</span>
            </div>
            <p className="leading-relaxed text-stone-400">
              香港美業真實點評與預約平台。我們深耕香港，立志消除美容界硬銷文化，打造100%明碼實價誠信指引。
            </p>
            <p className="text-[10px] text-stone-500">
              © 2026 OPEN BEAUTY HK. All rights reserved.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">核心倡導</h4>
            <ul className="space-y-2">
              <li>單次收費明碼實價</li>
              <li>無顧問房推銷制度</li>
              <li>實名單據誠信核實</li>
              <li>KOL 商業打手防範</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">熱門地區</h4>
            <ul className="space-y-2">
              <li>銅鑼灣美容院點評</li>
              <li>尖沙咀輕醫美推介</li>
              <li>旺角單次 facial 保濕</li>
              <li>中環男士理容美肌</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">條款與反饋</h4>
            <ul className="space-y-2">
              <li>美容院入駐與認證</li>
              <li>舉報硬銷與黑店投訴</li>
              <li>免責聲明與版權宣告</li>
              <li>隱私權保護政策</li>
            </ul>
          </div>

        </div>
      </footer>

      {/* --- MODAL 1: MERCHANT DETAIL MODAL (TRANSPARENCY PORTAL) --- */}
      {selectedMerchant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col justify-between border border-rose-100 animate-in fade-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#FAF7F5] to-white p-6 border-b border-rose-100/50 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 text-stone-400 text-xs mb-1">
                  <span>{selectedMerchant.district}</span>
                  <span>·</span>
                  <span>{selectedMerchant.category}</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#2D2625] flex items-center gap-2">
                  <span>{selectedMerchant.name}</span>
                  {favorites.includes(selectedMerchant.id) && (
                    <span className="text-rose-500 text-sm">♥ 已收藏</span>
                  )}
                </h3>
                <p className="text-xs text-stone-500 mt-1">{selectedMerchant.address}</p>
              </div>
              <button 
                onClick={() => setSelectedMerchant(null)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs Controller */}
            <div className="border-b border-stone-100 flex bg-stone-50/50">
              <button 
                onClick={() => setActiveModalTab("info")}
                className={`flex-1 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeModalTab === "info" ? "border-[#C2847A] text-[#C2847A] bg-white" : "border-transparent text-stone-500 hover:text-stone-800"}`}
              >
                環境與誠信雷達
              </button>
              <button 
                onClick={() => setActiveModalTab("pricing")}
                className={`flex-1 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeModalTab === "pricing" ? "border-[#C2847A] text-[#C2847A] bg-white" : "border-transparent text-stone-500 hover:text-stone-800"}`}
              >
                透明價目表 ({selectedMerchant.treatments.length}項)
              </button>
              <button 
                onClick={() => setActiveModalTab("reviews")}
                className={`flex-1 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeModalTab === "reviews" ? "border-[#C2847A] text-[#C2847A] bg-white" : "border-transparent text-stone-500 hover:text-stone-800"}`}
              >
                消費點評流 ({selectedMerchant.reviews.length}則)
              </button>
            </div>

            {/* Modal Body Scroll Container */}
            <div className="p-6 overflow-y-auto space-y-6 max-h-[55vh]">
              
              {/* TAB 1: ENVIRONMENTAL INFO & TRUST RADAR */}
              {activeModalTab === "info" && (
                <div className="space-y-6">
                  
                  {/* Mock gallery layout using CSS gradients */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 h-44 bg-gradient-to-tr from-[#FAF0ED] to-rose-100/40 rounded-xl flex items-center justify-center text-xs text-[#C2847A] font-medium p-4 text-center border border-rose-100/40 relative overflow-hidden">
                      <span className="relative z-10 font-serif">靜謐雅緻理療房 ． 獨立單人私密空間</span>
                      <div className="absolute inset-0 bg-black/5"></div>
                    </div>
                    <div className="grid grid-rows-2 gap-2">
                      <div className="bg-[#E5DDD9] rounded-xl flex items-center justify-center text-[10px] text-stone-600 font-medium p-2 text-center">
                        香薰美甲專區
                      </div>
                      <div className="bg-rose-50 rounded-xl flex items-center justify-center text-[10px] text-[#A74E52] font-medium p-2 text-center border border-rose-100">
                        原廠正貨儀器
                      </div>
                    </div>
                  </div>

                  {/* Trust Dashboard (誠信信任儀表盤) */}
                  <div className="bg-[#FAF7F5] rounded-xl p-4 border border-stone-200/50 space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2D2625] border-b border-stone-200 pb-2 flex items-center gap-1">
                      <span>🛡️ 誠信信任分析盤 (Trust Radar)</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Metric 1: Push Level */}
                      <div className="space-y-1 text-center md:text-left">
                        <span className="text-[10px] text-stone-400 block font-semibold">推銷壓力檢測</span>
                        <span className={`text-base font-bold block ${selectedMerchant.zeroHardSellIndex >= 4.7 ? "text-emerald-700" : "text-amber-700"}`}>
                          {selectedMerchant.zeroHardSellIndex >= 4.7 ? "😴 全程零打擾" : "🍵 輕度禮貌提及"}
                        </span>
                        <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden inline-block">
                          <div className="bg-emerald-600 h-full" style={{ width: `${(selectedMerchant.zeroHardSellIndex/5)*100}%` }}></div>
                        </div>
                      </div>

                      {/* Metric 2: Price Transparency */}
                      <div className="space-y-1 text-center md:text-left border-t md:border-t-0 md:border-l border-stone-200 pt-2 md:pt-0 md:pl-4">
                        <span className="text-[10px] text-stone-400 block font-semibold">價格透明度評估</span>
                        <span className="text-base font-bold text-[#2D2625] block">100% 透明無附加</span>
                        <span className="text-[10px] text-emerald-700 font-medium">✔️ 平台單次收費承諾書已簽</span>
                      </div>

                      {/* Metric 3: Authenticity Ratio */}
                      <div className="space-y-1 text-center md:text-left border-t md:border-t-0 md:border-l border-stone-200 pt-2 md:pt-0 md:pl-4">
                        <span className="text-[10px] text-stone-400 block font-semibold">消費單據證實比例</span>
                        <span className="text-base font-bold text-[#2D2625] block">
                          {(selectedMerchant.reviews.filter(r => r.verified).length / Math.max(selectedMerchant.reviews.length, 1) * 100).toFixed(0)}%
                        </span>
                        <span className="text-[10px] text-stone-400">已審核過真實單據</span>
                      </div>

                    </div>
                  </div>

                  {/* Business info table */}
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between border-b border-stone-100 py-2">
                      <span className="text-stone-400 font-medium">營業時間</span>
                      <span className="text-stone-700">星期一至日 11:00 - 21:00</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-100 py-2">
                      <span className="text-stone-400 font-medium">原廠證明</span>
                      <span className="text-emerald-700 font-semibold">已向 OPEN BEAUTY 遞交原廠正貨儀器及技師證書</span>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: TRANSPARENT PRICING ACCORDION */}
              {activeModalTab === "pricing" && (
                <div className="space-y-4">
                  <div className="p-3 bg-rose-50 text-[#A74E52] border border-rose-100 rounded-xl text-xs leading-relaxed">
                    <strong>💡 誠信消費保障：</strong> 凡於 OPEN BEAUTY 預約，均享有「單次試做價」保證。店鋪承諾絕不會在療程中途索取任何附加費，或強迫開立療程套票。
                  </div>

                  <div className="space-y-3">
                    {selectedMerchant.treatments.map((t, idx) => (
                      <div 
                        key={idx}
                        className="p-4 bg-white border border-stone-200/70 rounded-xl hover:border-[#C2847A]/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <h4 className="font-semibold text-stone-800">{t.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-stone-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{t.duration} 分鐘</span>
                            <span>·</span>
                            <span className="bg-emerald-50 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded">單次可做</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end md:self-auto">
                          <div className="text-right">
                            <span className="text-[10px] text-stone-400 block line-through">原價 HK${t.originalPrice}</span>
                            <span className="text-base font-bold text-[#A74E52]">體驗價 HK${t.trialPrice}</span>
                          </div>
                          
                          <button 
                            onClick={(e) => handleWhatsAppTrigger(selectedMerchant, t, e)}
                            className="bg-[#C2847A] hover:bg-[#A74E52] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            預約此療程
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: COMMUNITY REVIEWS FEED */}
              {activeModalTab === "reviews" && (
                <div className="space-y-6">
                  
                  {selectedMerchant.reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-stone-400 text-xs">暫無點評，歡迎您成為首位實名消費點評者！</p>
                    </div>
                  ) : (
                    selectedMerchant.reviews.map((rev) => (
                      <div key={rev.id} className="p-5 bg-[#FAF7F5]/50 border border-stone-200/50 rounded-2xl space-y-4">
                        
                        {/* Reviewer Header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-stone-800 text-xs">{rev.user}</span>
                              {rev.role === "Blogger" && (
                                <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[10px] px-1.5 py-0.5 rounded font-medium">
                                  👑 官方認證 Blogger / 達人
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-400">
                              皮膚：{rev.skin} · {rev.date}
                            </p>
                          </div>

                          {/* Star display & receipt check */}
                          <div className="text-right space-y-1">
                            <div className="flex items-center gap-0.5 justify-end">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-xs ${i < Math.floor(rev.star) ? "text-amber-400" : "text-stone-200"}`}>★</span>
                              ))}
                            </div>
                            
                            {rev.verified ? (
                              <button 
                                onClick={() => {
                                  if (rev.receiptUrl) {
                                    setReceiptZoomUrl(rev.receiptUrl);
                                    setIsReceiptZoomOpen(true);
                                  }
                                }}
                                className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] px-2 py-0.5 rounded-full font-medium cursor-pointer"
                              >
                                <span>🧾 已核實消費單據 (檢視)</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-stone-400 block italic">點評審核中</span>
                            )}
                          </div>
                        </div>

                        {/* Text */}
                        <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
                          {rev.text}
                        </p>

                        {/* Special Custom Metric Display */}
                        <div className="flex flex-wrap items-center gap-4 text-[11px] bg-white p-2.5 rounded-lg border border-stone-100">
                          <span className="text-stone-400">推銷壓力感受：</span>
                          <span className="font-semibold text-stone-700">
                            {getSliderHelpText(rev.pushLevel).split(" (")[0]}
                          </span>
                          <span>·</span>
                          <span className="text-stone-400">收費模式：</span>
                          <span className="font-semibold text-stone-700">{rev.pricing}</span>
                        </div>

                        {/* Receipt preview thumbnail */}
                        {rev.receiptUrl && (
                          <div className="pt-2">
                            <span className="text-[10px] text-stone-400 block mb-1">上傳單據（遮蔽隱私資訊）：</span>
                            <div 
                              onClick={() => {
                                setReceiptZoomUrl(rev.receiptUrl || null);
                                setIsReceiptZoomOpen(true);
                              }}
                              className="w-16 h-16 rounded border border-stone-200 bg-stone-100 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                            >
                              <div className="text-[9px] text-stone-400 text-center font-mono">
                                VIEW INV
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Merchant Reply */}
                        {rev.reply && (
                          <div className="bg-white p-3 rounded-xl border border-rose-100/60 ml-4 space-y-1.5">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-[#C2847A] font-bold">【商戶官方回覆】</span>
                              <span className="text-[9px] text-stone-400">Bare Skin Studio 代表</span>
                            </div>
                            <p className="text-stone-600 text-[11px] leading-relaxed">
                              {rev.reply}
                            </p>
                          </div>
                        )}

                      </div>
                    ))
                  )}

                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className="bg-[#FAF7F5] p-4 border-t border-rose-100/50 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="text-xs text-stone-400 text-center md:text-left">
                您正以 <span className="font-bold text-stone-600">{currentRole}</span> 身份瀏覽 ． 歡迎預約！
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button 
                  onClick={() => setSelectedMerchant(null)}
                  className="flex-1 md:flex-none border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  關閉
                </button>
                <button 
                  onClick={() => {
                    setTargetBookingTreatment({ merchantName: selectedMerchant.name, treatment: selectedMerchant.treatments[0] });
                    setIsWhatsAppOpen(true);
                  }}
                  className="flex-1 md:flex-none bg-[#C2847A] hover:bg-[#A74E52] text-white px-6 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  經 WhatsApp 預約諮詢
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 2: WRITE REVIEW FLOW WIZARD --- */}
      {isWriteReviewOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col justify-between border border-rose-100 animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="p-6 border-b border-rose-100/50 flex justify-between items-center bg-[#FAF7F5]">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2D2625] flex items-center gap-2">
                  <span>發表真實點評與消費單據上傳</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">您上傳的發票僅供後台人工比對，不對公眾展示任何個人信息。</p>
              </div>
              <button 
                onClick={() => setIsWriteReviewOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleWriteReviewSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {reviewSuccessMessage && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-4 rounded-xl space-y-2">
                  <p className="font-semibold">{reviewSuccessMessage}</p>
                  <p>系統自動模擬後台操作，您可切換為「超級管理員」直接處理該單據！</p>
                </div>
              )}

              {/* Merchant Selector */}
              <div className="space-y-1">
                <label className="block font-semibold text-stone-700">選擇美容院商戶 *</label>
                <select 
                  value={reviewMerchantId}
                  onChange={(e) => setReviewMerchantId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:border-[#C2847A]"
                  required
                >
                  <option value="">-- 請選擇 --</option>
                  {merchants.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.district})</option>
                  ))}
                </select>
              </div>

              {/* Stars Overall Satisfaction */}
              <div className="space-y-1">
                <label className="block font-semibold text-stone-700">整體服務滿意度 *</label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button 
                      type="button"
                      key={starVal}
                      onClick={() => setReviewRating(starVal)}
                      className="text-lg focus:outline-none cursor-pointer"
                    >
                      <span className={starVal <= reviewRating ? "text-amber-400" : "text-stone-200"}>★</span>
                    </button>
                  ))}
                  <span className="text-stone-400 ml-2 font-medium">({reviewRating} / 5 星)</span>
                </div>
              </div>

              {/* UNIQUE SLIDER FOR HARD SELL PRESSURE (Cantonese) */}
              <div className="space-y-2 bg-[#FAF7F5] p-3.5 rounded-xl border border-stone-100">
                <div className="flex justify-between items-center">
                  <label className="block font-bold text-[#A74E52]">獨創！療程推銷感受評估 *</label>
                  <span className="bg-[#A74E52]/10 text-[#A74E52] text-[10px] px-2 py-0.5 rounded font-bold">
                    零推銷指標
                  </span>
                </div>
                
                <p className="text-[10px] text-stone-400 leading-normal">
                  請誠實拉動以下滑塊。這將直接決定該店的「零推銷指數」，踢走強硬買Package黑店：
                </p>

                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={reviewPushLevel}
                  onChange={(e) => setReviewPushLevel(parseInt(e.target.value))}
                  className="w-full accent-[#C2847A] h-2 bg-stone-200 rounded-lg cursor-pointer"
                />

                <div className="p-2.5 bg-white rounded border border-stone-100 font-semibold text-stone-700 text-[11px]">
                  {getSliderHelpText(reviewPushLevel)}
                </div>
              </div>

              {/* Pricing mode checkboxes */}
              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => setReviewPricingMode("100% 單次收費")}
                  className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${reviewPricingMode === "100% 單次收費" ? "border-[#C2847A] bg-rose-50/20 font-semibold" : "border-stone-200 hover:bg-stone-50"}`}
                >
                  <span className="block mb-0.5 text-[#C2847A]">💰 100% 單次收費</span>
                  <span className="text-[9px] text-stone-400">明碼實價無套票</span>
                </div>
                <div 
                  onClick={() => setReviewPricingMode("購買了療程套票")}
                  className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${reviewPricingMode === "購買了療程套票" ? "border-stone-500 bg-stone-50 font-semibold" : "border-stone-200 hover:bg-stone-50"}`}
                >
                  <span className="block mb-0.5 text-stone-700">🎟️ 購買了療程套票</span>
                  <span className="text-[9px] text-stone-400">包含套裝多次使用</span>
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-1">
                <label className="block font-semibold text-stone-700">真實消費體驗 (過程有冇 hard sell？技師有冇偷鐘？環境乾唔乾淨？) *</label>
                <textarea 
                  rows={4}
                  placeholder="請誠實分享您的親身消費經歷。OPEN BEAUTY 團隊會核對單據以維護平台真實性，拒絕商業水軍、故意抹黑。"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:border-[#C2847A]"
                  required
                ></textarea>
              </div>

              {/* Skin Profile */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">皮膚特徵 / 年齡段</label>
                  <input 
                    type="text" 
                    placeholder="例如: 混乾敏感肌 · 25-30歲"
                    value={reviewSkin}
                    onChange={(e) => setReviewSkin(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 focus:outline-none focus:border-[#C2847A]"
                  />
                </div>
                
                {/* Simulated Receipt Upload Component */}
                <div className="space-y-1">
                  <label className="block font-bold text-amber-800">消費單據核對 ( Receipt Mock )</label>
                  
                  {uploadedReceiptName ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center justify-between text-[11px]">
                      <span className="truncate max-w-[120px] font-semibold text-amber-800">✔️ {uploadedReceiptName}</span>
                      <button 
                        type="button"
                        onClick={() => setUploadedReceiptName(null)}
                        className="text-stone-400 hover:text-stone-600"
                      >
                        清除
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => {
                        // Simulate selecting a receipt
                        const simulatedInvoices = ["INVOICE_BARE_280HKD.png", "INVOICE_AQUA_580HKD.png", "CHILL_SPA_RECEIPT.png"];
                        const randomInvoice = simulatedInvoices[Math.floor(Math.random() * simulatedInvoices.length)];
                        setUploadedReceiptName(randomInvoice);
                      }}
                      className="w-full bg-[#FAF0ED] hover:bg-rose-50 border-2 border-dashed border-rose-200 text-[#C2847A] py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>上傳發票 (認證)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-100">
                <button 
                  type="button"
                  onClick={() => setIsWriteReviewOpen(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="bg-[#C2847A] hover:bg-[#A74E52] text-white px-6 py-2 rounded-lg font-semibold cursor-pointer"
                >
                  發布點評
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* --- MODAL 3: WHATSAPP RESERVATION CONTEXT PREVIEW --- */}
      {isWhatsAppOpen && targetBookingTreatment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150">
            
            {/* Header simulated like a Phone Topbar */}
            <div className="bg-[#2D2625] text-white p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                WA
              </div>
              <div>
                <h4 className="font-semibold text-sm">{targetBookingTreatment.merchantName} 預約對話</h4>
                <p className="text-[10px] text-stone-300">OPEN BEAUTY 智能預約追蹤中...</p>
              </div>
            </div>

            {/* Simulated iPhone WhatsApp chat flow body */}
            <div className="bg-[#E5DDD5] p-4 min-h-[250px] space-y-4 flex flex-col justify-end">
              
              <div className="bg-emerald-50 text-[10px] text-emerald-800 text-center p-1.5 rounded-lg border border-emerald-100 mx-auto max-w-[240px]">
                🔒 對話受 OPEN BEAUTY 誠信消費者條款保護。商戶已承諾「免推銷、單次收費」安全承諾。
              </div>

              {/* Preset message */}
              <div className="bg-[#DCF8C6] text-[#2D2625] p-3 rounded-xl max-w-[85%] self-end text-xs shadow-xs space-y-1 relative">
                <p className="leading-relaxed">
                  您好！我係於 OPEN BEAUTY 美站上見到您哋嘅療程資訊。想預約預訂以下項目：
                </p>
                <div className="p-2 bg-white/70 rounded border border-emerald-100 font-semibold my-1.5">
                  ✨ {targetBookingTreatment.treatment.name} ({targetBookingTreatment.treatment.duration}分鐘)
                  <br />
                  💰 試做體驗價：HK$ {targetBookingTreatment.treatment.trialPrice}
                </div>
                <p className="leading-relaxed text-[10px] text-stone-500">
                  想安排預約下星期六，請問下午 2:00 或 4:00 有位嗎？感謝！
                </p>
                <span className="text-[8px] text-stone-400 absolute bottom-1 right-2">22:30 ✔️</span>
              </div>

            </div>

            {/* Actions */}
            <div className="p-4 bg-white border-t border-stone-100 space-y-2">
              <button 
                onClick={handleWhatsAppConfirmed}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>模擬經手機啟動 WhatsApp 發送</span>
              </button>
              <button 
                onClick={() => setIsWhatsAppOpen(false)}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer text-center"
              >
                返回修改
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 4: RECEIPTS VIEWER OVERLAY --- */}
      {isReceiptZoomOpen && receiptZoomUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 rounded-2xl w-full max-w-lg overflow-hidden border border-stone-800 shadow-2xl relative">
            
            <div className="p-4 bg-stone-950 border-b border-stone-800 flex justify-between items-center text-stone-200 text-xs">
              <span className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>消費單據安全核實預覽 (個人資訊已作打碼遮蔽)</span>
              </span>
              <button 
                onClick={() => setIsReceiptZoomOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Blur mock invoice image presentation representing safety & authenticity */}
            <div className="p-8 flex flex-col items-center justify-center bg-stone-900/50">
              <div className="w-full bg-white text-stone-800 rounded-lg p-6 shadow-md border-t-8 border-amber-500 font-mono text-[10px] space-y-4 max-w-xs relative overflow-hidden">
                
                {/* Blurred watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 select-none text-[#C2847A]/15 text-2xl font-bold font-sans tracking-widest text-center whitespace-nowrap">
                  OPEN BEAUTY<br />已驗證單據
                </div>

                <div className="text-center pb-2 border-b border-dashed border-stone-200">
                  <h4 className="font-bold text-xs">*** OFFICIAL RECEIPT ***</h4>
                  <p className="text-[8px] text-stone-400">OPEN BEAUTY VERIFIED TRANSACTION</p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>CUSTOMER NAME:</span>
                    <span className="bg-stone-800 text-stone-200 px-1 rounded select-none filter blur-[1.5px] font-sans">CHLOE CHAN***</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TEL NO:</span>
                    <span className="bg-stone-800 text-stone-200 px-1 rounded select-none filter blur-[1.5px] font-sans">9876-****</span>
                  </div>
                  <div className="flex justify-between">
                    <span>INVOICE NO:</span>
                    <span>OB-202609-08221</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE:</span>
                    <span>2026-09-18 14:32</span>
                  </div>
                </div>

                <div className="py-2 border-y border-dashed border-stone-200 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>ITEM DESCRIPTION</span>
                    <span>AMOUNT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1. DEEP PORE HYDRATION FACIAL</span>
                    <span>HK$ 280.00</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>(TRIAL EXPERIENCE SPECIAL PRICE)</span>
                    <span></span>
                  </div>
                  <div className="flex justify-between">
                    <span>2. SKIN BARRIER ANALYSIS</span>
                    <span>HK$ 0.00</span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="flex justify-between font-bold text-xs text-emerald-800">
                    <span>TOTAL AMOUNT PAID:</span>
                    <span>HK$ 280.00</span>
                  </div>
                  <p className="text-[7px] text-stone-400">METHOD: VISA / EPS CONTIGUOUS</p>
                </div>

                <div className="text-center pt-2 text-[7px] text-stone-400 border-t border-stone-100">
                  THANK YOU FOR CHOOSING OUR MEMBERSHIP
                  <br />
                  * 100% SINGLE SESSION - NO EXPIRY *
                </div>

              </div>

              <p className="text-[11px] text-stone-400 mt-6 text-center max-w-sm">
                本發票經 OPEN BEAUTY 高級管理員人工核對無誤，認證該筆點評由真實到店消費用戶發布，已杜絕同行惡性抹黑或店家自誇商業代刷。
              </p>
            </div>

            <div className="bg-stone-950 p-4 border-t border-stone-800 flex justify-end">
              <button 
                onClick={() => setIsReceiptZoomOpen(false)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                明白
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
