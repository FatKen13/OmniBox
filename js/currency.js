/**
 * Module Tỷ Giá Vietcombank & Chuyển Đổi Ngoại Tệ
 * - Tự động tải XML Vietcombank qua Proxy thông minh
 * - Lưu Cache LocalStorage 1 ngày/lần
 * - Fallback dữ liệu dự phòng đảm bảo luôn hoạt động
 */

const CurrencyManager = (() => {
  const CACHE_KEY = "vcb_exchange_rates_cache_v1";
  const VCB_XML_URL = "https://portal.vietcombank.com.vn/Usercontrols/TVWeb.TyGia/pXML.aspx";

  // Danh sách các CORS Proxy dự phòng (nếu cái này lỗi tự động thử cái tiếp theo)
  const PROXIES = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url) => `https://thingproxy.freeboard.io/fetch/${url}`
  ];

  // Tên tiếng Việt và cờ quốc gia cho các đồng tiền
  const CURRENCY_INFO = {
    VND: { name: "Việt Nam Đồng", country: "Việt Nam", flag: "🇻🇳", symbol: "₫" },
    USD: { name: "Đô la Mỹ", country: "Mỹ", flag: "🇺🇸", symbol: "$" },
    EUR: { name: "Đồng Euro", country: "Châu Âu", flag: "🇪🇺", symbol: "€" },
    JPY: { name: "Yên Nhật", country: "Nhật Bản", flag: "🇯🇵", symbol: "¥" },
    GBP: { name: "Bảng Anh", country: "Vương quốc Anh", flag: "🇬🇧", symbol: "£" },
    AUD: { name: "Đô la Úc", country: "Úc", flag: "🇦🇺", symbol: "A$" },
    CAD: { name: "Đô la Canada", country: "Canada", flag: "🇨🇦", symbol: "C$" },
    CHF: { name: "Franc Thụy Sĩ", country: "Thụy Sĩ", flag: "🇨🇭", symbol: "CHF" },
    CNY: { name: "Nhân dân tệ", country: "Trung Quốc", flag: "🇨🇳", symbol: "¥" },
    HKD: { name: "Đô la Hồng Kông", country: "Hồng Kông", flag: "🇭🇰", symbol: "HK$" },
    INR: { name: "Rupee Ấn Độ", country: "Ấn Độ", flag: "🇮🇳", symbol: "₹" },
    KRW: { name: "Won Hàn Quốc", country: "Hàn Quốc", flag: "🇰🇷", symbol: "₩" },
    KWD: { name: "Dinar Kuwait", country: "Kuwait", flag: "🇰🇼", symbol: "KD" },
    MYR: { name: "Ringgit Malaysia", country: "Malaysia", flag: "🇲🇾", symbol: "RM" },
    NOK: { name: "Krone Na Uy", country: "Na Uy", flag: "🇳🇴", symbol: "kr" },
    RUB: { name: "Rúp Nga", country: "Nga", flag: "🇷🇺", symbol: "₽" },
    SAR: { name: "Riyal Ả Rập Xê Út", country: "Ả Rập Xê Út", flag: "🇸🇦", symbol: "SR" },
    SEK: { name: "Krona Thụy Điển", country: "Thụy Điển", flag: "🇸🇪", symbol: "kr" },
    SGD: { name: "Đô la Singapore", country: "Singapore", flag: "🇸🇬", symbol: "S$" },
    THB: { name: "Baht Thái", country: "Thái Lan", flag: "🇹🇭", symbol: "฿" }
  };

  // Dữ liệu dự phòng tiêu chuẩn nếu hoàn toàn không có internet
  const FALLBACK_RATES = {
    dateTime: "Tỷ giá tham khảo mặc định",
    source: "Vietcombank (Offline Preset)",
    items: [
      { code: "USD", name: "US DOLLAR", buy: 25120, transfer: 25150, sell: 25480 },
      { code: "EUR", name: "EURO", buy: 27100, transfer: 27350, sell: 28550 },
      { code: "JPY", name: "JAPANESE YEN", buy: 161.2, transfer: 162.8, sell: 171.5 },
      { code: "GBP", name: "BRITISH POUND", buy: 32400, transfer: 32700, sell: 33800 },
      { code: "CNY", name: "CHINESE YUAN", buy: 3450, transfer: 3485, sell: 3600 },
      { code: "KRW", name: "SOUTH KOREAN WON", buy: 16.5, transfer: 18.2, sell: 20.1 },
      { code: "AUD", name: "AUST.DOLLAR", buy: 16400, transfer: 16550, sell: 17100 },
      { code: "CAD", name: "CANADIAN DOLLAR", buy: 18200, transfer: 18400, sell: 19000 },
      { code: "SGD", name: "SINGAPORE DOLLAR", buy: 19100, transfer: 19300, sell: 19900 },
      { code: "THB", name: "THAI BAHT", buy: 710, transfer: 730, sell: 800 }
    ]
  };

  // Làm sạch chuỗi số tỷ giá (vd: "25,120.00" -> 25120)
  function parseRateValue(valStr) {
    if (!valStr || valStr === "-" || valStr === "N/A") return 0;
    const clean = valStr.toString().replace(/,/g, "").trim();
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }

  // Phân tích cú pháp chuỗi XML của Vietcombank
  function parseVcbXml(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // Kiểm tra lỗi parse XML
    const parseError = xmlDoc.querySelector("parsererror");
    if (parseError) {
      throw new Error("Lỗi đọc dữ liệu XML từ Vietcombank.");
    }

    const dateTimeElem = xmlDoc.querySelector("DateTime");
    const dateTime = dateTimeElem ? dateTimeElem.textContent.trim() : new Date().toLocaleString("vi-VN");

    const exrateNodes = xmlDoc.querySelectorAll("Exrate");
    const items = [];

    exrateNodes.forEach(node => {
      const code = node.getAttribute("CurrencyCode")?.trim().toUpperCase();
      const name = node.getAttribute("CurrencyName")?.trim();
      const buy = parseRateValue(node.getAttribute("Buy"));
      const transfer = parseRateValue(node.getAttribute("Transfer"));
      const sell = parseRateValue(node.getAttribute("Sell"));

      if (code) {
        items.push({
          code,
          name: name || code,
          buy: buy || transfer,
          transfer: transfer || buy,
          sell: sell || transfer || buy
        });
      }
    });

    if (items.length === 0) {
      throw new Error("Bảng tỷ giá XML rỗng.");
    }

    return {
      dateTime,
      source: "Vietcombank (Chính thức)",
      timestamp: Date.now(),
      items
    };
  }

  // Lưu vào LocalStorage
  function saveToCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Không thể lưu cache tỷ giá:", e);
    }
  }

  // Đọc từ LocalStorage
  function getFromCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  // Lấy tỷ giá trực tuyến với cơ chế đa Proxy & Fallback
  async function fetchExchangeRates(forceRefresh = false) {
    // 1. Nếu không bắt buộc làm mới, kiểm tra cache có còn trong ngày không (trong vòng 12h)
    const cached = getFromCache();
    const now = Date.now();
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;

    if (!forceRefresh && cached && cached.items && cached.items.length > 0) {
      if (now - (cached.timestamp || 0) < TWELVE_HOURS) {
        return { data: cached, fromCache: true };
      }
    }

    // 2. Thử tải từ Vietcombank qua danh sách Proxy
    let lastError = null;
    for (const proxyGen of PROXIES) {
      try {
        const proxyUrl = proxyGen(VCB_XML_URL);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 giây timeout

        const response = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: { "Accept": "application/xml, text/xml, */*" }
        });
        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const xmlText = await response.text();
        if (xmlText && xmlText.includes("Exrate")) {
          const parsedData = parseVcbXml(xmlText);
          saveToCache(parsedData);
          return { data: parsedData, fromCache: false };
        }
      } catch (err) {
        lastError = err;
      }
    }

    // 3. Nếu các proxy đều lỗi, dùng cache cũ nếu có
    if (cached && cached.items) {
      return { data: cached, fromCache: true, warning: "Đang dùng dữ liệu đã lưu gần nhất" };
    }

    // 4. Nếu chưa từng có cache, dùng Fallback chuẩn
    return { data: FALLBACK_RATES, fromCache: true, isFallback: true };
  }

  // Tính toán đổi tiền giữa 2 đơn vị bất kỳ
  // rateType: 'sell' (Khách mua ngoại tệ từ ngân hàng), 'buy' (Khách bán tiền mặt), 'transfer' (Khách chuyển khoản)
  function convertCurrency(amount, fromCode, toCode, rateData, rateType = "sell") {
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0) return 0;
    if (fromCode === toCode) return num;

    const items = rateData.items;

    // Helper: lấy giá VND của 1 đơn vị ngoại tệ
    function getVndRate(code) {
      if (code === "VND") return 1;
      const item = items.find(i => i.code === code);
      if (!item) return 0;
      return item[rateType] || item.sell || item.transfer || item.buy || 1;
    }

    const fromRateInVnd = getVndRate(fromCode);
    const toRateInVnd = getVndRate(toCode);

    if (fromRateInVnd === 0 || toRateInVnd === 0) return 0;

    // Quy đổi: Số tiền nguồn -> Quy ra VND -> Quy sang tiền đích
    const amountInVnd = num * fromRateInVnd;
    const result = amountInVnd / toRateInVnd;

    return result;
  }

  // Format tiền tệ đẹp mắt
  function formatMoney(amount, currencyCode) {
    if (isNaN(amount) || amount === null) return "0";
    
    // Nếu là VND thì không cần số thập phân
    if (currencyCode === "VND") {
      return Math.round(amount).toLocaleString("vi-VN") + " ₫";
    }

    // Các ngoại tệ thông thường
    return amount.toLocaleString("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }) + " " + (CURRENCY_INFO[currencyCode]?.symbol || currencyCode);
  }

  return {
    fetchExchangeRates,
    convertCurrency,
    formatMoney,
    CURRENCY_INFO,
    getFromCache
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CurrencyManager;
}
