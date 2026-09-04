/**
 * Module Dữ Liệu Giá Vàng & Biểu Đồ Thị Trường
 * Hỗ trợ các thương hiệu: SJC, DOJI, PNJ, Vàng Nhẫn 9999, Vàng 24K, 18K, 14K
 */

const GoldManager = (() => {
  const GOLD_CACHE_KEY = "omnibox_gold_rates_v1";

  // Danh mục các loại vàng phổ biến
  const GOLD_TYPES = [
    {
      id: "sjc_hcm",
      brand: "SJC",
      name: "Vàng SJC 1L - 10L",
      city: "Toàn quốc",
      buy: 88.5,       // Triệu đồng / lượng
      sell: 90.5,
      change: 0.5,     // Tăng 500k so với hôm qua
      trend: "up"
    },
    {
      id: "sjc_nhan",
      brand: "SJC",
      name: "Vàng nhẫn SJC 99.99 (1-5 chỉ)",
      city: "TP.HCM",
      buy: 87.2,
      sell: 88.8,
      change: 0.3,
      trend: "up"
    },
    {
      id: "doji_hn",
      brand: "DOJI",
      name: "Vàng DOJI AVPL (Hà Nội)",
      city: "Hà Nội",
      buy: 88.5,
      sell: 90.5,
      change: 0.5,
      trend: "up"
    },
    {
      id: "doji_hcm",
      brand: "DOJI",
      name: "Vàng DOJI AVPL (TP.HCM)",
      city: "TP.HCM",
      buy: 88.5,
      sell: 90.5,
      change: 0.5,
      trend: "up"
    },
    {
      id: "pnj_gold",
      brand: "PNJ",
      name: "Vàng PNJ (24K) - Trơn",
      city: "Toàn quốc",
      buy: 87.3,
      sell: 88.9,
      change: 0.4,
      trend: "up"
    },
    {
      id: "btmc_rong",
      brand: "Bảo Tín Minh Châu",
      name: "Vàng Rồng Thăng Long",
      city: "Hà Nội",
      buy: 87.4,
      sell: 89.0,
      change: 0.2,
      trend: "up"
    },
    {
      id: "gold_9999",
      brand: "Thị trường",
      name: "Vàng 24K (99.99% - Nữ trang)",
      city: "Tự do",
      buy: 86.0,
      sell: 87.8,
      change: 0.3,
      trend: "up"
    },
    {
      id: "gold_18k",
      brand: "Thị trường",
      name: "Vàng 18K (75.0% - Nữ trang)",
      city: "Tự do",
      buy: 63.5,
      sell: 65.5,
      change: 0.2,
      trend: "up"
    },
    {
      id: "gold_14k",
      brand: "Thị trường",
      name: "Vàng 14K (58.3% - Nữ trang)",
      city: "Tự do",
      buy: 49.0,
      sell: 51.2,
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
    const baseBuy = 88.5;
    const baseSell = 90.5;

    // Mô phỏng chuỗi biến động giá thực tế
    const seedDeltas = [
      -0.8, -0.6, -0.4, -0.2, 0.0, 0.3, 0.5, 0.2, -0.1, 0.4,
      0.6, 0.8, 1.2, 0.9, 0.5, 0.2, -0.3, -0.5, -0.1, 0.4,
      0.7, 1.0, 0.8, 0.5, 0.2, 0.0, 0.3, 0.4, 0.5, 0.5
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

  return {
    GOLD_TYPES,
    generateHistoricalData,
    calculateGoldMoney,
    formatVnd
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoldManager;
}
