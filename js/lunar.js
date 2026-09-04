/**
 * Thư viện tính toán Lịch Âm Dương Việt Nam
 * Dựa trên thuật toán của GS. Hồ Ngọc Đức (Múi giờ GMT+7)
 */

const LunarCalendar = (() => {
  const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  const CON_GIAP = ["Chuột", "Trâu", "Hổ", "Mèo", "Rồng", "Rắn", "Ngựa", "Dê", "Khỉ", "Gà", "Chó", "Lợn"];
  
  const TIET_KHI = [
    "Xuân phân", "Thanh minh", "Cốc vũ", "Lập hạ", "Tiểu mãn", "Mang chủng",
    "Hạ chí", "Tiểu thử", "Đại thử", "Lập thu", "Xử thử", "Bạch lộ",
    "Thu phân", "Hàn lộ", "Sương giáng", "Lập đông", "Tiểu tuyết", "Đại tuyết",
    "Đông chí", "Tiểu hàn", "Đại hàn", "Lập xuân", "Vũ thủy", "Kinh trập"
  ];

  const HOANG_DAO_CHI = [
    [0, 1, 3, 4, 6, 9],    // Dần, Thân (Tý, Sửu, Mão, Thìn, Ngọ, Dậu)
    [2, 3, 5, 6, 8, 11],   // Mão, Dậu (Dần, Mão, Tỵ, Ngọ, Thân, Hợi)
    [0, 4, 5, 7, 8, 10],   // Thìn, Tuất (Tý, Thìn, Tỵ, Mùi, Thân, Tuất)
    [1, 2, 6, 7, 9, 10],   // Tỵ, Hợi (Sửu, Dần, Ngọ, Mùi, Dậu, Tuất)
    [0, 2, 3, 7, 8, 11],   // Tý, Ngọ (Tý, Dần, Mão, Mùi, Thân, Hợi)
    [1, 4, 5, 8, 9, 11]    // Sửu, Mùi (Sửu, Thìn, Tỵ, Thân, Dậu, Hợi)
  ];

  const GIO_HOANG_DAO_MAP = {
    "Tý": [0, 1, 3, 5, 7, 8],      // Tý, Sửu, Mão, Tỵ, Thân, Dậu
    "Sửu": [2, 3, 5, 8, 9, 11],    // Dần, Mão, Tỵ, Thân, Dậu, Hợi
    "Dần": [0, 1, 4, 6, 7, 10],    // Tý, Sửu, Thìn, Tỵ, Mùi, Tuất
    "Mão": [0, 2, 3, 5, 8, 9],     // Tý, Dần, Mão, Ngọ, Thân, Dậu
    "Thìn": [2, 4, 5, 7, 10, 11],  // Dần, Thìn, Tỵ, Thân, Dậu, Hợi
    "Tỵ": [1, 2, 5, 7, 8, 11],     // Sửu, Dần, Thìn, Ngọ, Mùi, Tuất
    "Ngọ": [0, 1, 3, 5, 7, 8],     // Tý, Sửu, Mão, Tỵ, Thân, Dậu
    "Mùi": [2, 3, 5, 8, 9, 11],    // Dần, Mão, Tỵ, Thân, Dậu, Hợi
    "Thân": [0, 1, 4, 6, 7, 10],   // Tý, Sửu, Thìn, Tỵ, Mùi, Tuất
    "Dậu": [0, 2, 3, 5, 8, 9],     // Tý, Dần, Mão, Ngọ, Thân, Dậu
    "Tuất": [2, 4, 5, 7, 10, 11],  // Dần, Thìn, Tỵ, Thân, Dậu, Hợi
    "Hợi": [1, 2, 5, 7, 8, 11]     // Sửu, Dần, Thìn, Ngọ, Mùi, Tuất
  };

  const GIO_KHUNG = [
    { name: "Tý", time: "23:00 - 00:59" },
    { name: "Sửu", time: "01:00 - 02:59" },
    { name: "Dần", time: "03:00 - 04:59" },
    { name: "Mão", time: "05:00 - 06:59" },
    { name: "Thìn", time: "07:00 - 08:59" },
    { name: "Tỵ", time: "09:00 - 10:59" },
    { name: "Ngọ", time: "11:00 - 12:59" },
    { name: "Mùi", time: "13:00 - 14:59" },
    { name: "Thân", time: "15:00 - 16:59" },
    { name: "Dậu", time: "17:00 - 18:59" },
    { name: "Tuất", time: "19:00 - 20:59" },
    { name: "Hợi", time: "21:00 - 22:59" }
  ];

  const LE_TET = {
    // Dương lịch
    "solar": {
      "1-1": "Tết Dương Lịch (New Year)",
      "14-2": "Lễ tình nhân (Valentine)",
      "8-3": "Quốc tế Phụ nữ",
      "26-3": "Thành lập Đoàn TNCS Hồ Chí Minh",
      "30-4": "Giải phóng miền Nam",
      "1-5": "Quốc tế Lao động",
      "7-5": "Chiến thắng Điện Biên Phủ",
      "19-5": "Sinh nhật Chủ tịch Hồ Chí Minh",
      "1-6": "Quốc tế Thiếu nhi",
      "28-6": "Ngày Gia đình Việt Nam",
      "27-7": "Ngày Thương binh Liệt sĩ",
      "19-8": "Cách mạng Tháng Tám",
      "2-9": "Quốc khánh Việt Nam",
      "20-10": "Ngày Phụ nữ Việt Nam",
      "20-11": "Ngày Nhà giáo Việt Nam",
      "22-12": "Thành lập QĐND Việt Nam",
      "24-12": "Lễ Giáng sinh (Noel)"
    },
    // Âm lịch
    "lunar": {
      "1-1": "Tết Nguyên Đán (Mùng 1 Tết)",
      "2-1": "Mùng 2 Tết",
      "3-1": "Mùng 3 Tết",
      "15-1": "Tết Nguyên Tiêu (Rằm tháng Giêng)",
      "3-3": "Tết Hàn Thực (Bánh trôi bánh chay)",
      "10-3": "Giỗ Tổ Hùng Vương",
      "15-4": "Lễ Phật Đản",
      "5-5": "Tết Đoan Ngọ (Giết sâu bọ)",
      "15-7": "Lễ Vu Lan & Xá tội vong nhân",
      "15-8": "Tết Trung Thu",
      "9-9": "Tết Trùng Cửu",
      "10-10": "Tết Thường Tân (Tết cơm mới)",
      "23-12": "Ông Công Ông Táo chầu trời"
    }
  };

  // Chuyển đổi ngày Dương -> Julian Day
  function jdFromDate(dd, mm, yy) {
    const a = Math.floor((14 - mm) / 12);
    const y = yy + 4800 - a;
    const m = mm + 12 * a - 3;
    let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    if (jd < 2299161) {
      jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
    }
    return jd;
  }

  // Chuyển đổi Julian Day -> Ngày Dương (dd, mm, yy)
  function jdToDate(jd) {
    let a, b, c, d, e, m, day, month, year;
    if (jd > 2299160) {
      const a_prime = Math.floor((jd - 1867216.25) / 36524.25);
      a = jd + 1 + a_prime - Math.floor(a_prime / 4);
    } else {
      a = jd;
    }
    b = a + 1524;
    c = Math.floor((b - 122.1) / 365.25);
    d = Math.floor(365.25 * c);
    e = Math.floor((b - d) / 30.6001);
    day = Math.floor(b - d - Math.floor(30.6001 * e));
    month = e < 14 ? e - 1 : e - 13;
    year = month > 2 ? c - 4716 : c - 4715;
    return [day, month, year];
  }

  // Tính số ngày Sóc mới (New Moon) theo thuật toán thiên văn
  function getNewMoonDay(k, timeZone) {
    const T = k / 1236.85;
    const T2 = T * T;
    const T3 = T2 * T;
    const dr = Math.PI / 180;
    let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    
    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    
    let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * M * dr);
    C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * Mpr * dr);
    C1 -= 0.0004 * Math.sin(3 * Mpr * dr);
    C1 += 0.0104 * Math.sin(2 * F * dr) - 0.0051 * Math.sin((M + Mpr) * dr);
    C1 -= 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
    C1 -= 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
    C1 += 0.001 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr);

    let JdNew = Jd1 + C1;
    return Math.floor(JdNew + 0.5 + timeZone / 24);
  }

  // Tính kinh độ Mặt Trời (Sun Longitude)
  function getSunLongitude(jdn, timeZone) {
    const T = (jdn - 2451545.0 - timeZone / 24) / 36525;
    const T2 = T * T;
    const dr = Math.PI / 180;
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T2;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T2;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T2) * Math.sin(M * dr) +
              (0.019993 - 0.000101 * T) * Math.sin(2 * M * dr) +
              0.000289 * Math.sin(3 * M * dr);
    let L = L0 + C;
    L = L * dr;
    L = L - Math.PI * 2 * Math.floor(L / (Math.PI * 2));
    return Math.floor((L / Math.PI) * 6); // Trả về 0 -> 11 theo các cung 30 độ
  }

  // Chuyển Dương Lịch sang Âm Lịch (Việt Nam GMT+7)
  function convertSolar2Lunar(dd, mm, yy, timeZone = 7) {
    const dayNumber = jdFromDate(dd, mm, yy);
    const k = Math.floor((dayNumber - 2415021.0769986) / 29.530588853);
    let monthStart = getNewMoonDay(k + 1, timeZone);
    if (monthStart > dayNumber) {
      monthStart = getNewMoonDay(k, timeZone);
    }
    
    let a11 = getLunarMonth11(yy, timeZone);
    let b11 = a11;
    let lunarYear;
    if (a11 >= monthStart) {
      lunarYear = yy;
      a11 = getLunarMonth11(yy - 1, timeZone);
    } else {
      lunarYear = yy + 1;
      b11 = getLunarMonth11(yy + 1, timeZone);
    }
    
    const lunarDay = dayNumber - monthStart + 1;
    const diff = Math.floor((monthStart - a11) / 29);
    let lunarLeap = 0;
    let lunarMonth = diff + 11;
    
    if (b11 - a11 > 365) {
      const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
      if (diff >= leapMonthDiff) {
        lunarMonth = diff + 10;
        if (diff === leapMonthDiff) {
          lunarLeap = 1;
        }
      }
    }
    if (lunarMonth > 12) {
      lunarMonth -= 12;
    }
    if (lunarMonth >= 11 && diff < 4) {
      lunarYear -= 1;
    }

    return {
      day: lunarDay,
      month: lunarMonth,
      year: lunarYear,
      isLeap: lunarLeap === 1,
      solarDay: dd,
      solarMonth: mm,
      solarYear: yy
    };
  }

  function getLunarMonth11(yy, timeZone) {
    const off = jdFromDate(31, 12, yy) - 2415021;
    const k = Math.floor(off / 29.530588853);
    let nm = getNewMoonDay(k, timeZone);
    const sunLong = getSunLongitude(nm, timeZone);
    if (sunLong >= 9) {
      nm = getNewMoonDay(k - 1, timeZone);
    }
    return nm;
  }

  function getLeapMonthOffset(a11, timeZone) {
    const k = Math.floor((a11 - 2415021.0769986) / 29.530588853 + 0.5);
    let last = 0;
    let i = 1;
    let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    do {
      last = arc;
      i++;
      arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    } while (arc !== last && i < 14);
    return i - 1;
  }

  // Tính Can Chi cho Ngày, Tháng, Năm
  function getCanChi(dd, mm, yy, lunarDay, lunarMonth, lunarYear) {
    // Can Chi Năm
    const canYear = CAN[(lunarYear + 6) % 10];
    const chiYear = CHI[(lunarYear + 8) % 12];
    const conGiapYear = CON_GIAP[(lunarYear + 8) % 12];

    // Can Chi Tháng
    const canMonthIdx = (lunarYear * 12 + lunarMonth + 3) % 10;
    const chiMonthIdx = (lunarMonth + 1) % 12;
    const canMonth = CAN[canMonthIdx];
    const chiMonth = CHI[chiMonthIdx];

    // Can Chi Ngày (Dựa trên Julian Day)
    const jd = jdFromDate(dd, mm, yy);
    const canDayIdx = (jd + 9) % 10;
    const chiDayIdx = (jd + 1) % 12;
    const canDay = CAN[canDayIdx];
    const chiDay = CHI[chiDayIdx];
    const conGiapDay = CON_GIAP[chiDayIdx];

    return {
      year: `${canYear} ${chiYear}`,
      conGiapYear: conGiapYear,
      month: `${canMonth} ${chiMonth}`,
      day: `${canDay} ${chiDay}`,
      conGiapDay: conGiapDay,
      canDayIdx: canDayIdx,
      chiDayIdx: chiDayIdx,
      chiDayName: chiDay
    };
  }

  // Tính Tiết Khí
  function getTietKhi(dd, mm, yy) {
    const jd = jdFromDate(dd, mm, yy);
    const angle = getSunLongitude(jd, 7);
    return TIET_KHI[angle * 2] || "Bình thường";
  }

  // Kiểm tra Ngày Hoàng Đạo / Hắc Đạo
  function getHoangDaoStatus(lunarMonth, chiDayIdx) {
    // Tháng Tý (11), Ngọ (5) -> group 4
    // Tháng Sửu (12), Mùi (6) -> group 5
    // Tháng Dần (1), Thân (7) -> group 0
    // Tháng Mão (2), Dậu (8) -> group 1
    // Tháng Thìn (3), Tuất (9) -> group 2
    // Tháng Tỵ (4), Hợi (10) -> group 3
    const monthGroupMap = {
      1: 0, 7: 0,
      2: 1, 8: 1,
      3: 2, 9: 2,
      4: 3, 10: 3,
      5: 4, 11: 4,
      6: 5, 12: 5
    };
    const group = monthGroupMap[lunarMonth] ?? 0;
    const isHoangDao = HOANG_DAO_CHI[group].includes(chiDayIdx);
    return {
      isHoangDao: isHoangDao,
      label: isHoangDao ? "Ngày Hoàng Đạo (Tốt)" : "Ngày Hắc Đạo (Xấu)",
      badgeClass: isHoangDao ? "badge-good" : "badge-bad"
    };
  }

  // Lấy danh sách Giờ Hoàng Đạo trong ngày
  function getGioHoangDao(chiDayName) {
    const goodIndices = GIO_HOANG_DAO_MAP[chiDayName] || [];
    return GIO_KHUNG.map((g, idx) => ({
      ...g,
      isGood: goodIndices.includes(idx),
      type: goodIndices.includes(idx) ? "Hoàng Đạo" : "Hắc Đạo"
    }));
  }

  // Tính hướng xuất hành (Tài thần, Hỷ thần) theo Can ngày
  function getHuongXuatHanh(canDayIdx) {
    // Can: 0=Giáp, 1=Ất, 2=Bính, 3=Đinh, 4=Mậu, 5=Kỷ, 6=Canh, 7=Tân, 8=Nhâm, 9=Quý
    const hyThanMap = ["Đông Bắc", "Tây Bắc", "Tây Nam", "Chính Nam", "Đông Nam", "Đông Bắc", "Tây Bắc", "Tây Nam", "Chính Nam", "Đông Nam"];
    const taiThanMap = ["Đông Nam", "Đông Nam", "Chính Đông", "Chính Đông", "Chính Bắc", "Chính Nam", "Chính Tây", "Tây Bắc", "Chính Tây", "Chính Bắc"];

    return {
      hyThan: hyThanMap[canDayIdx] || "Đông Nam",
      taiThan: taiThanMap[canDayIdx] || "Tài Thần Chính Đông"
    };
  }

  // Kiểm tra ngày lễ âm / dương
  function getHoliday(solarDay, solarMonth, lunarDay, lunarMonth) {
    const sKey = `${solarDay}-${solarMonth}`;
    const lKey = `${lunarDay}-${lunarMonth}`;
    const holidays = [];
    if (LE_TET.solar[sKey]) holidays.push({ type: "solar", title: LE_TET.solar[sKey] });
    if (LE_TET.lunar[lKey]) holidays.push({ type: "lunar", title: LE_TET.lunar[lKey] });
    return holidays;
  }

  // Thông tin đầy đủ cho 1 ngày
  function getFullDayInfo(dateObj = new Date()) {
    const dd = dateObj.getDate();
    const mm = dateObj.getMonth() + 1;
    const yy = dateObj.getFullYear();
    const dayOfWeek = dateObj.getDay(); // 0: CN, 1: T2, ...
    const dayOfWeekNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

    const lunar = convertSolar2Lunar(dd, mm, yy, 7);
    const canChi = getCanChi(dd, mm, yy, lunar.day, lunar.month, lunar.year);
    const tietKhi = getTietKhi(dd, mm, yy);
    const hoangDao = getHoangDaoStatus(lunar.month, canChi.chiDayIdx);
    const gioList = getGioHoangDao(canChi.chiDayName);
    const huong = getHuongXuatHanh(canChi.canDayIdx);
    const holidays = getHoliday(dd, mm, lunar.day, lunar.month);

    return {
      solar: {
        day: dd,
        month: mm,
        year: yy,
        dayOfWeek: dayOfWeekNames[dayOfWeek],
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6
      },
      lunar: {
        day: lunar.day,
        month: lunar.month,
        year: lunar.year,
        isLeap: lunar.isLeap
      },
      canChi,
      tietKhi,
      hoangDao,
      gioHoangDao: gioList,
      huongXuatHanh: huong,
      holidays
    };
  }

  // Lấy dữ liệu toàn bộ ma trận tháng để vẽ Lịch Tháng
  function getMonthMatrix(year, month) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const totalDays = lastDay.getDate();
    
    // Bắt đầu từ Thứ Hai (Monday = 1, CN = 7)
    let startDayOfWeek = firstDay.getDay(); 
    startDayOfWeek = startDayOfWeek === 0 ? 7 : startDayOfWeek; // Chuyển CN thành 7

    const matrix = [];
    let currentWeek = [];

    // Lấp đầy các ngày của tháng trước
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    for (let i = startDayOfWeek - 1; i > 0; i--) {
      const prevD = prevMonthLastDay - i + 1;
      const prevDate = new Date(year, month - 2, prevD);
      const info = getFullDayInfo(prevDate);
      currentWeek.push({ ...info, isCurrentMonth: false });
    }

    // Các ngày trong tháng hiện tại
    for (let d = 1; d <= totalDays; d++) {
      const curDate = new Date(year, month - 1, d);
      const info = getFullDayInfo(curDate);
      currentWeek.push({ ...info, isCurrentMonth: true });
      
      if (currentWeek.length === 7) {
        matrix.push(currentWeek);
        currentWeek = [];
      }
    }

    // Lấp đầy các ngày của tháng sau cho đủ tuần cuối
    if (currentWeek.length > 0) {
      let nextD = 1;
      while (currentWeek.length < 7) {
        const nextDate = new Date(year, month, nextD);
        const info = getFullDayInfo(nextDate);
        currentWeek.push({ ...info, isCurrentMonth: false });
        nextD++;
      }
      matrix.push(currentWeek);
    }

    return matrix;
  }

  // Chuyển đổi Âm Lịch sang Dương Lịch (Việt Nam GMT+7)
  function convertLunar2Solar(lunarDay, lunarMonth, lunarYear, lunarLeap = 0, timeZone = 7) {
    let a11, b11;
    if (lunarMonth < 11) {
      a11 = getLunarMonth11(lunarYear - 1, timeZone);
      b11 = getLunarMonth11(lunarYear, timeZone);
    } else {
      a11 = getLunarMonth11(lunarYear, timeZone);
      b11 = getLunarMonth11(lunarYear + 1, timeZone);
    }
    const k = Math.floor((a11 - 2415021.0769986) / 29.530588853 + 0.5);
    let off = lunarMonth - 11;
    if (off < 0) {
      off += 12;
    }
    if (b11 - a11 > 365) {
      const leapOff = getLeapMonthOffset(a11, timeZone);
      let leapMonth = leapOff - 2;
      if (leapMonth < 0) {
        leapMonth += 12;
      }
      if (lunarLeap !== 0 && lunarMonth !== leapMonth) {
        return null;
      } else if (lunarLeap !== 0 || off >= leapOff) {
        off += 1;
      }
    }
    const monthStart = getNewMoonDay(k + off, timeZone);
    const [d, m, y] = jdToDate(monthStart + lunarDay - 1);
    return { day: d, month: m, year: y };
  }

  return {
    convertSolar2Lunar,
    convertLunar2Solar,
    getFullDayInfo,
    getMonthMatrix,
    LE_TET,
    CAN,
    CHI,
    CON_GIAP,
    TIET_KHI
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LunarCalendar;
}
