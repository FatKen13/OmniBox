/**
 * Module Dữ Liệu Giá Vàng & Biểu Đồ Thị Trường
 * Hỗ trợ các thương hiệu: SJC, DOJI, PNJ, Vàng Nhẫn 9999, Vàng 24K, 18K, 14K
 */

const GoldManager = (() => {
  const GOLD_CACHE_KEY = "omnibox_gold_rates_v1";

  // Danh mục các loại vàng thực tế chuẩn thị trường 2026
  const GOLD_TYPES = [
    {
      id: "sjc_hcm",
      brand: "SJC",
      name: "Vàng miếng SJC 1L - 10L",
      city: "Toàn quốc",
      buy: 145.6,       // 145.6 triệu đồng / lượng (14.56 triệu / chỉ)
      sell: 148.6,      // 148.6 triệu đồng / lượng (14.86 triệu / chỉ)
      change: 0.2,
      trend: "up"
    },
    {
      id: "sjc_nhan",
      brand: "SJC",
      name: "Vàng nhẫn SJC 99.99 (1-5 chỉ)",
      city: "TP.HCM",
      buy: 147.5,
      sell: 150.5,
      change: 0.3,
      trend: "up"
    },
    {
      id: "doji_hn",
      brand: "DOJI",
      name: "Vàng DOJI AVPL (Hà Nội)",
      city: "Hà Nội",
      buy: 145.6,
      sell: 148.6,
      change: 0.2,
      trend: "up"
    },
    {
      id: "doji_hcm",
      brand: "DOJI",
      name: "Vàng DOJI AVPL (TP.HCM)",
      city: "TP.HCM",
      buy: 145.6,
      sell: 148.6,
      change: 0.2,
      trend: "up"
    },
    {
      id: "pnj_gold",
      brand: "PNJ",
      name: "Vàng PNJ (24K) - Trơn",
      city: "Toàn quốc",
      buy: 145.6,
      sell: 148.6,
      change: 0.2,
      trend: "up"
    },
    {
      id: "btmc_rong",
      brand: "Bảo Tín Minh Châu",
      name: "Vàng Rồng Thăng Long",
      city: "Hà Nội",
      buy: 145.6,
      sell: 148.6,
      change: 0.2,
      trend: "up"
    },
    {
      id: "gold_9999",
      brand: "Thị trường",
      name: "Vàng 24K (99.99% - Nữ trang)",
      city: "Tự do",
      buy: 143.5,
      sell: 146.5,
      change: 0.2,
      trend: "up"
    },
    {
      id: "gold_18k",
      brand: "Thị trường",
      name: "Vàng 18K (75.0% - Nữ trang)",
      city: "Tự do",
      buy: 106.5,
      sell: 109.5,
      change: 0.1,
      trend: "up"
    },
    {
      id: "gold_14k",
      brand: "Thị trường",
      name: "Vàng 14K (58.3% - Nữ trang)",
      city: "Tự do",
      buy: 82.0,
      sell: 85.0,
      change: 0.1,
      trend: "up"
    }
  ];

  // Tạo dữ liệu lịch sử giá vàng 30 ngày cho Biểu đồ
  function generateHistoricalData(days = 30) {
    const labels = [];
    const buyData = [];
    const sellData = [];

    const now = new Date();
    const baseBuy = 145.6;
    const baseSell = 148.6;

    // Mô phỏng chuỗi biến động giá thực tế
    const seedDeltas = [
      -1.5, -1.2, -0.8, -0.5, 0.0, 0.5, 0.8, 0.4, -0.2, 0.6,
      1.0, 1.4, 2.0, 1.5, 0.8, 0.3, -0.4, -0.8, -0.2, 0.6,
      1.2, 1.8, 1.4, 0.8, 0.3, 0.0, 0.4, 0.6, 0.8, 0.8
    ];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
      labels.push(dateStr);

      const deltaIdx = (days - 1 - i) % seedDeltas.length;
      const delta = seedDeltas[deltaIdx] * (1 + (Math.sin(i * 0.4) * 0.2));

      const buyVal = parseFloat((baseBuy - (seedDeltas[seedDeltas.length - 1] - delta)).toFixed(2));
      const sellVal = parseFloat((baseSell - (seedDeltas[seedDeltas.length - 1] - delta)).toFixed(2));

      buyData.push(buyVal);
      sellData.push(sellVal);
    }

    return { labels, buyData, sellData };
  }

  // Tính tiền mua/bán vàng
  // amount: số lượng (ví dụ 2.5)
  // unit: 'cay' (lượng/cây = 1.0), 'chi' (chỉ = 0.1), 'phan' (phân = 0.01)
  // goldTypeId: id loại vàng
  // action: 'buy' (khách bán cho tiệm, tiệm mua vào) | 'sell' (khách mua từ tiệm, tiệm bán ra)
  function calculateGoldMoney(amount, unit, goldTypeId, action = "sell") {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return 0;

    const item = GOLD_TYPES.find(g => g.id === goldTypeId) || GOLD_TYPES[0];
    const unitMultiplier = unit === "cay" ? 1.0 : unit === "chi" ? 0.1 : 0.01;

    // Giá tính theo Triệu đồng / Lượng -> Quy ra VNĐ
    const pricePerLuongInVnd = item[action] * 1000000;
    const totalVnd = num * unitMultiplier * pricePerLuongInVnd;

    return {
      totalVnd,
      pricePerLuong: item[action],
      goldName: item.name
    };
  }

  // Format tiền VNĐ
  function formatVnd(amount) {
    if (isNaN(amount) || amount === 0) return "0 ₫";
    return Math.round(amount).toLocaleString("vi-VN") + " ₫";
  }

  // Nạp dữ liệu giá vàng mới nhất từ DataHub-Public (hoặc cache cục bộ)
  async function fetchLatestGoldFromDB() {
    // 1. Thử lấy từ DataHub-Public CDN trực tuyến
    if (typeof DataHub !== 'undefined' && DataHub.getPublicData) {
      try {
        const json = await DataHub.getPublicData("market/gold.json");
        if (json && json.items && json.items.length > 0) {
          return json;
        }
      } catch (e) {
        console.warn("[GoldManager] DataHub-Public offline, fallback local cache:", e);
      }
    }

    // 2. Fallback file local data/gold-latest.json
    try {
      const res = await fetch("data/gold-latest.json");
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Dung du lieu vang offline:", e);
    }
    return null;
  }

  // Nạp lịch sử giá vàng từ DataHub-Public theo mốc thời gian ('7d', '30d', '1y', 'all')
  async function fetchHistoryGoldFromDB(timeframe = "7d") {
    const filenameMap = {
      "7d": "market/history/gold-history-7d.json",
      "30d": "market/history/gold-history-30d.json",
      "1y": "market/history/gold-history-1y.json",
      "all": "market/history/gold-history-all.json"
    };

    const endpoint = filenameMap[timeframe] || filenameMap["7d"];

    if (typeof DataHub !== 'undefined' && DataHub.getPublicData) {
      try {
        const rawHistory = await DataHub.getPublicData(endpoint);
        if (Array.isArray(rawHistory) && rawHistory.length > 0) {
          const labels = [];
          const buyData = [];
          const sellData = [];

          rawHistory.forEach(item => {
            const parts = item.date.split("-");
            // Định dạng nhãn hiển thị: Nếu là 'all' thì hiện mm/yy hoặc yyyy, còn ngắn ngày thì dd/mm
            let label = `${parseInt(parts[2])}/${parseInt(parts[1])}`;
            if (timeframe === "all") {
              label = `${parts[1]}/${parts[0].slice(2)}`;
            } else if (timeframe === "1y") {
              label = `${parts[2]}/${parts[1]}`;
            }
            labels.push(label);
            buyData.push(item.buy);
            sellData.push(item.sell);
          });

          return { labels, buyData, sellData };
        }
      } catch (e) {
        console.warn(`[GoldManager] Khong the tai history ${timeframe} tu DataHub:`, e);
      }
    }

    // Fallback mô phỏng nếu không có mạng
    const daysMap = { "7d": 7, "30d": 30, "1y": 365, "all": 1800 };
    return generateHistoricalData(daysMap[timeframe] || 7);
  }

  return {
    GOLD_TYPES,
    generateHistoricalData,
    fetchLatestGoldFromDB,
    fetchHistoryGoldFromDB,
    calculateGoldMoney,
    formatVnd
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoldManager;
}
