/**
 * Thư viện chuyển đổi đơn vị đo lường toàn diện
 * Hỗ trợ hệ đơn vị quốc tế (SI/Imperial) và hệ truyền thống Việt Nam
 */

const UnitConverter = (() => {
  const CATEGORIES = {
    length: {
      id: "length",
      name: "Chiều Dài & Khoảng Cách",
      icon: "fa-ruler-horizontal",
      baseUnit: "m",
      units: [
        { id: "mm", name: "Milimét (mm)", factor: 0.001 },
        { id: "cm", name: "Centimét (cm)", factor: 0.01 },
        { id: "dm", name: "Đêximét (dm)", factor: 0.1 },
        { id: "m", name: "Mét (m)", factor: 1 },
        { id: "km", name: "Kilômét (km)", factor: 1000 },
        { id: "inch", name: "Inch (in)", factor: 0.0254 },
        { id: "ft", name: "Foot / Feet (ft)", factor: 0.3048 },
        { id: "yd", name: "Yard (yd)", factor: 0.9144 },
        { id: "mile", name: "Dặm Anh (mile)", factor: 1609.344 },
        { id: "nmi", name: "Hải lý / Dặm biển (NM)", factor: 1852 },
        { id: "thuoc_ta", name: "Thước ta cổ truyền (0.4m)", factor: 0.4 },
        { id: "ly", name: "Dặm cổ truyền / Lý (500m)", factor: 500 }
      ]
    },

    mass: {
      id: "mass",
      name: "Khối Lượng & Trọng Lượng",
      icon: "fa-weight-hanging",
      baseUnit: "g",
      units: [
        { id: "mg", name: "Miligam (mg)", factor: 0.001 },
        { id: "g", name: "Gam (g)", factor: 1 },
        { id: "kg", name: "Kilôgam (kg)", factor: 1000 },
        { id: "yen", name: "Yến (10 kg)", factor: 10000 },
        { id: "ta", name: "Tạ (100 kg)", factor: 100000 },
        { id: "tan", name: "Tấn (1,000 kg)", factor: 1000000 },
        { id: "chi_vang", name: "Chỉ vàng (3.75 g)", factor: 3.75 },
        { id: "cay_vang", name: "Cây / Lượng vàng (37.5 g)", factor: 37.5 },
        { id: "lang_ta", name: "Lạng truyền thống (1/10 cân = 100g)", factor: 100 },
        { id: "lb", name: "Pound (lbs)", factor: 453.59237 },
        { id: "oz", name: "Ounce (oz)", factor: 28.349523125 },
        { id: "carat", name: "Carat đá quý (ct)", factor: 0.2 }
      ]
    },

    area: {
      id: "area",
      name: "Diện Tích & Đo Đất",
      icon: "fa-vector-square",
      baseUnit: "m2",
      units: [
        { id: "cm2", name: "Centimét vuông (cm²)", factor: 0.0001 },
        { id: "m2", name: "Mét vuông (m²)", factor: 1 },
        { id: "ha", name: "Hécta (ha)", factor: 10000 },
        { id: "km2", name: "Kilômét vuông (km²)", factor: 1000000 },
        { id: "sao_bac", name: "Sào Bắc Bộ (360 m²)", factor: 360 },
        { id: "sao_trung", name: "Sào Trung Bộ (500 m²)", factor: 500 },
        { id: "cong_nam", name: "Công đất / Sào Nam Bộ (1,000 m²)", factor: 1000 },
        { id: "mau_bac", name: "Mẫu Bắc Bộ (10 sào = 3,600 m²)", factor: 3600 },
        { id: "mau_trung", name: "Mẫu Trung Bộ (10 sào = 5,000 m²)", factor: 5000 },
        { id: "mau_nam", name: "Mẫu Nam Bộ (10 công = 10,000 m²)", factor: 10000 },
        { id: "thuoc_dat", name: "Thước đất Bắc Bộ (24 m²)", factor: 24 },
        { id: "acre", name: "Mẫu Anh (Acre)", factor: 4046.8564224 },
        { id: "sqft", name: "Foot vuông (sq ft)", factor: 0.09290304 }
      ]
    },

    volume: {
      id: "volume",
      name: "Thể Tích & Dung Tích",
      icon: "fa-cubes",
      baseUnit: "l",
      units: [
        { id: "ml", name: "Mililít (mL / cc)", factor: 0.001 },
        { id: "l", name: "Lít (L)", factor: 1 },
        { id: "m3", name: "Mét khối (m³ / khối)", factor: 1000 },
        { id: "gal_us", name: "Gallon Mỹ (gal US)", factor: 3.785411784 },
        { id: "gal_uk", name: "Gallon Anh (gal UK)", factor: 4.54609 },
        { id: "barrel", name: "Thùng dầu (Barrel bbl)", factor: 158.987295 },
        { id: "cup", name: "Cốc nấu ăn (Cup 240mL)", factor: 0.24 },
        { id: "tbsp", name: "Muỗng canh (Tablespoon 15mL)", factor: 0.015 },
        { id: "tsp", name: "Muỗng cà phê (Teaspoon 5mL)", factor: 0.005 }
      ]
    },

    temperature: {
      id: "temperature",
      name: "Nhiệt Độ",
      icon: "fa-temperature-high",
      baseUnit: "c",
      isCustom: true,
      units: [
        { id: "c", name: "Độ Celsius (°C)" },
        { id: "f", name: "Độ Fahrenheit (°F)" },
        { id: "k", name: "Độ Kelvin (K)" }
      ]
    },

    data: {
      id: "data",
      name: "Dung Lượng Dữ Liệu Số",
      icon: "fa-microchip",
      baseUnit: "b",
      units: [
        { id: "bit", name: "Bit (b)", factor: 0.125 },
        { id: "b", name: "Byte (B)", factor: 1 },
        { id: "kb", name: "Kilobyte (KB - 1024 B)", factor: 1024 },
        { id: "mb", name: "Megabyte (MB)", factor: 1048576 },
        { id: "gb", name: "Gigabyte (GB)", factor: 1073741824 },
        { id: "tb", name: "Terabyte (TB)", factor: 1099511627776 },
        { id: "pb", name: "Petabyte (PB)", factor: 1125899906842624 },
        { id: "mb_dec", name: "Megabit Mạng (Mbps)", factor: 125000 }
      ]
    },

    speed: {
      id: "speed",
      name: "Tốc Độ & Vận Tốc",
      icon: "fa-tachometer-alt",
      baseUnit: "mps",
      units: [
        { id: "mps", name: "Mét trên giây (m/s)", factor: 1 },
        { id: "kmh", name: "Kilômét trên giờ (km/h)", factor: 1 / 3.6 },
        { id: "mph", name: "Dặm trên giờ (mph)", factor: 0.44704 },
        { id: "knot", name: "Hải lý/giờ (Knot)", factor: 0.514444444 },
        { id: "mach", name: "Tốc độ âm thanh (Mach)", factor: 340.3 }
      ]
    },

    pressure: {
      id: "pressure",
      name: "Áp Suất",
      icon: "fa-compress-arrows-alt",
      baseUnit: "pa",
      units: [
        { id: "pa", name: "Pascal (Pa)", factor: 1 },
        { id: "kpa", name: "Kilopascal (kPa)", factor: 1000 },
        { id: "bar", name: "Bar", factor: 100000 },
        { id: "atm", name: "Atmosphere tiêu chuẩn (atm)", factor: 101325 },
        { id: "psi", name: "Pound / sq inch (PSI)", factor: 6894.757 },
        { id: "mmhg", name: "Milimét thủy ngân (mmHg / Torr)", factor: 133.322 }
      ]
    },

    energy: {
      id: "energy",
      name: "Năng Lượng & Điện Năng",
      icon: "fa-bolt",
      baseUnit: "j",
      units: [
        { id: "j", name: "Joule (J)", factor: 1 },
        { id: "kj", name: "Kilojoule (kJ)", factor: 1000 },
        { id: "cal", name: "Calorie (cal)", factor: 4.184 },
        { id: "kcal", name: "Kilocalorie (kcal / Cal)", factor: 4184 },
        { id: "kwh", name: "Số điện (Kilowatt-giờ kWh)", factor: 3600000 },
        { id: "btu", name: "BTU (Điều hòa)", factor: 1055.056 }
      ]
    }
  };

  // Hàm chuyển đổi chính
  function convert(categoryId, fromUnitId, toUnitId, value) {
    const num = parseFloat(value);
    if (isNaN(num)) return null;

    const category = CATEGORIES[categoryId];
    if (!category) return null;

    // Trường hợp đặc biệt: Nhiệt độ
    if (categoryId === "temperature") {
      return convertTemperature(fromUnitId, toUnitId, num);
    }

    const fromUnit = category.units.find(u => u.id === fromUnitId);
    const toUnit = category.units.find(u => u.id === toUnitId);

    if (!fromUnit || !toUnit) return null;

    // Chuyển về base unit rồi từ base unit sang target unit
    const baseValue = num * fromUnit.factor;
    const result = baseValue / toUnit.factor;

    return result;
  }

  // Chuyển đổi nhiệt độ
  function convertTemperature(from, to, val) {
    if (from === to) return val;

    let celsius;
    if (from === "c") celsius = val;
    else if (from === "f") celsius = (val - 32) * (5 / 9);
    else if (from === "k") celsius = val - 273.15;
    else return null;

    if (to === "c") return celsius;
    if (to === "f") return celsius * (9 / 5) + 32;
    if (to === "k") return celsius + 273.15;
    return null;
  }

  // Định dạng số đẹp mắt (tránh số phẩy quá dài hoặc dạng scientific khi không cần thiết)
  function formatResult(num) {
    if (num === null || isNaN(num)) return "";
    if (num === 0) return "0";
    
    // Nếu số quá bé hoặc quá lớn
    const abs = Math.abs(num);
    if (abs < 0.000001 || abs >= 1e12) {
      return num.toExponential(6).replace(/e\+?/, " × 10^");
    }

    // Làm tròn tối đa 8 chữ số thập phân, bỏ số 0 thừa
    return parseFloat(num.toFixed(8)).toLocaleString("vi-VN", { maximumFractionDigits: 8 });
  }

  return {
    CATEGORIES,
    convert,
    formatResult
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UnitConverter;
}
