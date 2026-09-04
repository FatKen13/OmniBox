/**
 * App Controller - Tiện Ích Việt
 * Quản lý sự kiện, chuyển đổi Tab, Theme và kết nối các Module
 */

document.addEventListener("DOMContentLoaded", () => {
  // Global State
  const state = {
    theme: localStorage.getItem("theme_pref") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
    currentDate: new Date(),
    viewMonthDate: new Date(),
    selectedUnitCategory: "length",
    rateType: "sell", // 'sell' | 'transfer' | 'buy'
    currencyRates: null
  };

  /* ==========================================================================
     1. TOAST NOTIFICATION HELPER
     ========================================================================== */
  function showToast(message, icon = "fa-check-circle") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  /* ==========================================================================
     2. THEME CONTROLLER
     ========================================================================== */
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme_pref", theme);
    state.theme = theme;
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = theme === "dark" 
        ? '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>' 
        : '<i class="fa-solid fa-moon"></i>';
    }
  }

  applyTheme(state.theme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      applyTheme(state.theme === "dark" ? "light" : "dark");
    });
  }

  /* ==========================================================================
     3. TAB SWITCHER
     ========================================================================== */
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      
      tabBtns.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      tabContents.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      const activeContent = document.getElementById(`tab-${tabId}`);
      if (activeContent) {
        activeContent.classList.add("active");
      }
    });
  });

  /* ==========================================================================
     4. TAB 1: LỊCH VẠN NIÊN CONTROLLER
     ========================================================================== */
  function renderHeaderToday() {
    const today = new Date();
    const info = LunarCalendar.getFullDayInfo(today);
    
    const headerTodayText = document.getElementById("header-today-text");
    if (headerTodayText) {
      headerTodayText.textContent = `${info.solar.dayOfWeek}, ${info.solar.day}/${info.solar.month}/${info.solar.year}`;
    }

    const headerLunarText = document.getElementById("header-lunar-text");
    if (headerLunarText) {
      headerLunarText.textContent = `${info.lunar.day}/${info.lunar.month} ÂL (${info.canChi.day})`;
    }
  }

  function renderBlocCalendar(date) {
    const info = LunarCalendar.getFullDayInfo(date);

    // Bloc Solar Info
    document.getElementById("bloc-solar-month-year").textContent = `THÁNG ${info.solar.month} NĂM ${info.solar.year}`;
    document.getElementById("bloc-solar-dayname").textContent = info.solar.dayOfWeek.toUpperCase();
    document.getElementById("bloc-solar-day").textContent = info.solar.day < 10 ? `0${info.solar.day}` : info.solar.day;

    // Bloc Lunar Info
    document.getElementById("bloc-lunar-day").textContent = info.lunar.day;
    const leapText = info.lunar.isLeap ? " (Nhuận)" : "";
    document.getElementById("bloc-lunar-month-year").textContent = `Tháng ${info.lunar.month}${leapText} - Năm ${info.canChi.year}`;

    // Can Chi
    document.getElementById("bloc-canchi-year").textContent = info.canChi.year;
    document.getElementById("bloc-canchi-month").textContent = info.canChi.month;
    document.getElementById("bloc-canchi-day").textContent = info.canChi.day;

    // Badges: Hoàng Đạo, Tiết Khí, Hướng
    const hoangDaoBadge = document.getElementById("bloc-hoangdao-badge");
    const hoangDaoText = document.getElementById("bloc-hoangdao-text");
    hoangDaoBadge.className = `badge ${info.hoangDao.badgeClass}`;
    hoangDaoText.textContent = info.hoangDao.label;

    document.getElementById("bloc-tietkhi-text").textContent = `Tiết: ${info.tietKhi}`;
    document.getElementById("bloc-hythan-text").textContent = info.huongXuatHanh.hyThan;

    // Holiday Alert
    const holidayAlert = document.getElementById("bloc-holiday-alert");
    const holidayText = document.getElementById("bloc-holiday-text");
    if (info.holidays.length > 0) {
      holidayAlert.style.display = "flex";
      holidayText.textContent = info.holidays.map(h => h.title).join(" • ");
    } else {
      holidayAlert.style.display = "none";
    }

    // Giờ Hoàng Đạo
    const gioContainer = document.getElementById("gio-hoangdao-container");
    gioContainer.innerHTML = "";
    info.gioHoangDao.forEach(g => {
      const gioEl = document.createElement("div");
      gioEl.className = `gio-item ${g.isGood ? "good" : "bad"}`;
      gioEl.innerHTML = `
        <div class="name">
          <span>Giờ ${g.name}</span>
          ${g.isGood ? '<i class="fa-solid fa-circle-check" style="color: var(--good-color); font-size: 0.75rem;"></i>' : ''}
        </div>
        <div class="time">${g.time}</div>
      `;
      gioContainer.appendChild(gioEl);
    });
  }

  function renderMonthMatrix(year, month) {
    const titleEl = document.getElementById("month-matrix-title");
    titleEl.textContent = `Tháng ${month}, ${year}`;

    const container = document.getElementById("month-days-container");
    container.innerHTML = "";

    const matrix = LunarCalendar.getMonthMatrix(year, month);
    const today = new Date();

    matrix.forEach(week => {
      week.forEach(dayInfo => {
        const cell = document.createElement("div");
        cell.className = "day-cell";

        if (!dayInfo.isCurrentMonth) {
          cell.classList.add("other-month");
        }

        // Highlight Selected Date
        if (
          dayInfo.solar.day === state.currentDate.getDate() &&
          dayInfo.solar.month === state.currentDate.getMonth() + 1 &&
          dayInfo.solar.year === state.currentDate.getFullYear()
        ) {
          cell.classList.add("selected");
        }

        // Highlight Today
        if (
          dayInfo.solar.day === today.getDate() &&
          dayInfo.solar.month === today.getMonth() + 1 &&
          dayInfo.solar.year === today.getFullYear()
        ) {
          cell.classList.add("today");
        }

        const isMungMot = dayInfo.lunar.day === 1;
        const lunarDisplay = isMungMot ? `1/${dayInfo.lunar.month}` : dayInfo.lunar.day;

        cell.innerHTML = `
          <div class="solar-num">${dayInfo.solar.day}</div>
          <div class="lunar-num ${isMungMot ? 'mung-mot' : ''}">${lunarDisplay}</div>
        `;

        cell.addEventListener("click", () => {
          state.currentDate = new Date(dayInfo.solar.year, dayInfo.solar.month - 1, dayInfo.solar.day);
          renderBlocCalendar(state.currentDate);
          renderMonthMatrix(state.viewMonthDate.getFullYear(), state.viewMonthDate.getMonth() + 1);
        });

        container.appendChild(cell);
      });
    });
  }

  // Calendar Event Listeners
  document.getElementById("btn-prev-day").addEventListener("click", () => {
    state.currentDate.setDate(state.currentDate.getDate() - 1);
    state.viewMonthDate = new Date(state.currentDate);
    renderBlocCalendar(state.currentDate);
    renderMonthMatrix(state.viewMonthDate.getFullYear(), state.viewMonthDate.getMonth() + 1);
  });

  document.getElementById("btn-next-day").addEventListener("click", () => {
    state.currentDate.setDate(state.currentDate.getDate() + 1);
    state.viewMonthDate = new Date(state.currentDate);
    renderBlocCalendar(state.currentDate);
    renderMonthMatrix(state.viewMonthDate.getFullYear(), state.viewMonthDate.getMonth() + 1);
  });

  document.getElementById("btn-today-day").addEventListener("click", () => {
    state.currentDate = new Date();
    state.viewMonthDate = new Date();
    renderBlocCalendar(state.currentDate);
    renderMonthMatrix(state.viewMonthDate.getFullYear(), state.viewMonthDate.getMonth() + 1);
  });

  document.getElementById("btn-prev-month").addEventListener("click", () => {
    state.viewMonthDate.setMonth(state.viewMonthDate.getMonth() - 1);
    renderMonthMatrix(state.viewMonthDate.getFullYear(), state.viewMonthDate.getMonth() + 1);
  });

  document.getElementById("btn-next-month").addEventListener("click", () => {
    state.viewMonthDate.setMonth(state.viewMonthDate.getMonth() + 1);
    renderMonthMatrix(state.viewMonthDate.getFullYear(), state.viewMonthDate.getMonth() + 1);
  });

  document.getElementById("btn-current-month").addEventListener("click", () => {
    state.viewMonthDate = new Date();
    renderMonthMatrix(state.viewMonthDate.getFullYear(), state.viewMonthDate.getMonth() + 1);
  });

  /* ==========================================================================
     4.1. BỘ TÌM & CHỌN NGÀY (DƯƠNG LỊCH & ÂM LỊCH)
     ========================================================================== */
  const btnModeSolar = document.getElementById("btn-mode-solar");
  const btnModeLunar = document.getElementById("btn-mode-lunar");
  const formSearchSolar = document.getElementById("form-search-solar");
  const formSearchLunar = document.getElementById("form-search-lunar");
  const solarPickDate = document.getElementById("solar-pick-date");
  const lunarPickDay = document.getElementById("lunar-pick-day");
  const lunarPickMonth = document.getElementById("lunar-pick-month");
  const lunarPickYear = document.getElementById("lunar-pick-year");

  // Đặt giá trị mặc định cho Solar Date input (YYYY-MM-DD)
  function initSolarDateInput() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    solarPickDate.value = `${yyyy}-${mm}-${dd}`;
  }
  initSolarDateInput();

  // Chuyển tab chế độ tìm kiếm
  btnModeSolar.addEventListener("click", () => {
    btnModeSolar.classList.add("active");
    btnModeLunar.classList.remove("active");
    formSearchSolar.style.display = "block";
    formSearchLunar.style.display = "none";
  });

  btnModeLunar.addEventListener("click", () => {
    btnModeLunar.classList.add("active");
    btnModeSolar.classList.remove("active");
    formSearchSolar.style.display = "none";
    formSearchLunar.style.display = "block";
  });

  // Tìm theo Dương lịch
  formSearchSolar.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = solarPickDate.value;
    if (!val) return;

    const [y, m, d] = val.split("-").map(Number);
    state.currentDate = new Date(y, m - 1, d);
    state.viewMonthDate = new Date(state.currentDate);

    renderBlocCalendar(state.currentDate);
    renderMonthMatrix(state.viewMonthDate.getFullYear(), state.viewMonthDate.getMonth() + 1);
    showToast(`Đã chuyển tới ngày ${d}/${m}/${y}!`, "fa-calendar-check");
  });

  // Tìm theo Âm lịch
  formSearchLunar.addEventListener("submit", (e) => {
    e.preventDefault();
    const lDay = parseInt(lunarPickDay.value, 10);
    const lMonth = parseInt(lunarPickMonth.value, 10);
    const lYear = parseInt(lunarPickYear.value, 10);

    if (isNaN(lDay) || isNaN(lMonth) || isNaN(lYear)) {
      showToast("Vui lòng nhập đầy đủ ngày/tháng/năm âm lịch!", "fa-circle-exclamation");
      return;
    }

    const solarRes = LunarCalendar.convertLunar2Solar(lDay, lMonth, lYear, 0, 7);
    if (!solarRes || !solarRes.year) {
      showToast("Không tìm thấy ngày âm lịch hợp lệ!", "fa-circle-exclamation");
      return;
    }

    state.currentDate = new Date(solarRes.year, solarRes.month - 1, solarRes.day);
    state.viewMonthDate = new Date(state.currentDate);

    renderBlocCalendar(state.currentDate);
    renderMonthMatrix(state.viewMonthDate.getFullYear(), state.viewMonthDate.getMonth() + 1);
    
    // Cập nhật lại input solar date picker
    const yyyy = solarRes.year;
    const mm = String(solarRes.month).padStart(2, "0");
    const dd = String(solarRes.day).padStart(2, "0");
    solarPickDate.value = `${yyyy}-${mm}-${dd}`;

    showToast(`Âm lịch ${lDay}/${lMonth}/${lYear} ➔ Dương lịch ${solarRes.day}/${solarRes.month}/${solarRes.year}!`, "fa-moon");
  });

  // Nút tra nhanh Lễ / Tết
  document.querySelectorAll(".festival-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const raw = chip.getAttribute("data-lunar");
      if (!raw) return;
      const [lDay, lMonth, lYear] = raw.split("-").map(Number);
      
      const solarRes = LunarCalendar.convertLunar2Solar(lDay, lMonth, lYear, 0, 7);
      if (solarRes) {
        state.currentDate = new Date(solarRes.year, solarRes.month - 1, solarRes.day);
        state.viewMonthDate = new Date(state.currentDate);

        renderBlocCalendar(state.currentDate);
        renderMonthMatrix(state.viewMonthDate.getFullYear(), state.viewMonthDate.getMonth() + 1);

        const yyyy = solarRes.year;
        const mm = String(solarRes.month).padStart(2, "0");
        const dd = String(solarRes.day).padStart(2, "0");
        solarPickDate.value = `${yyyy}-${mm}-${dd}`;

        showToast(`Đã mở ${chip.textContent.trim()} (${solarRes.day}/${solarRes.month}/${solarRes.year})!`, "fa-gift");
      }
    });
  });

  /* ==========================================================================
     5. TAB 2: ĐỔI ĐƠN VỊ CONTROLLER
     ========================================================================== */
  const catBar = document.getElementById("unit-categories-bar");
  const fromSelect = document.getElementById("unit-from-select");
  const toSelect = document.getElementById("unit-to-select");
  const fromInput = document.getElementById("unit-from-input");
  const toInput = document.getElementById("unit-to-input");
  const formulaHint = document.getElementById("unit-formula-hint");

  function renderUnitCategories() {
    catBar.innerHTML = "";
    Object.values(UnitConverter.CATEGORIES).forEach((cat, index) => {
      const chip = document.createElement("button");
      chip.className = `cat-chip ${cat.id === state.selectedUnitCategory ? "active" : ""}`;
      chip.innerHTML = `<i class="fa-solid ${cat.icon}"></i> <span>${cat.name}</span>`;
      chip.addEventListener("click", () => {
        state.selectedUnitCategory = cat.id;
        document.querySelectorAll(".cat-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        populateUnitSelects();
        calculateUnitConversion();
      });
      catBar.appendChild(chip);
    });
  }

  function populateUnitSelects() {
    const category = UnitConverter.CATEGORIES[state.selectedUnitCategory];
    if (!category) return;

    fromSelect.innerHTML = "";
    toSelect.innerHTML = "";

    category.units.forEach((u, idx) => {
      const optFrom = document.createElement("option");
      optFrom.value = u.id;
      optFrom.textContent = u.name;
      fromSelect.appendChild(optFrom);

      const optTo = document.createElement("option");
      optTo.value = u.id;
      optTo.textContent = u.name;
      toSelect.appendChild(optTo);
    });

    // Chọn mặc định 2 đơn vị khác nhau
    if (category.units.length > 1) {
      fromSelect.selectedIndex = 0;
      toSelect.selectedIndex = 1;
    }
  }

  function calculateUnitConversion() {
    const val = fromInput.value;
    if (val === "" || isNaN(val)) {
      toInput.value = "";
      formulaHint.innerHTML = `<i class="fa-solid fa-circle-info"></i> Nhập giá trị hợp lệ để tính toán`;
      return;
    }

    const fromUnitId = fromSelect.value;
    const toUnitId = toSelect.value;
    const result = UnitConverter.convert(state.selectedUnitCategory, fromUnitId, toUnitId, val);
    
    toInput.value = UnitConverter.formatResult(result);

    // Update hint formula
    const unit1Res = UnitConverter.convert(state.selectedUnitCategory, fromUnitId, toUnitId, 1);
    const fromName = fromSelect.options[fromSelect.selectedIndex]?.text.split(" (")[0] || "";
    const toName = toSelect.options[toSelect.selectedIndex]?.text.split(" (")[0] || "";
    formulaHint.innerHTML = `<strong>1 ${fromName}</strong> = <strong>${UnitConverter.formatResult(unit1Res)} ${toName}</strong>`;
  }

  fromInput.addEventListener("input", calculateUnitConversion);
  fromSelect.addEventListener("change", calculateUnitConversion);
  toSelect.addEventListener("change", calculateUnitConversion);

  document.getElementById("btn-swap-units").addEventListener("click", () => {
    const tempIdx = fromSelect.selectedIndex;
    fromSelect.selectedIndex = toSelect.selectedIndex;
    toSelect.selectedIndex = tempIdx;
    calculateUnitConversion();
  });

  document.getElementById("btn-copy-unit-result").addEventListener("click", () => {
    if (toInput.value) {
      navigator.clipboard.writeText(toInput.value).then(() => {
        showToast("Đã sao chép kết quả vào bộ nhớ tạm!");
      });
    }
  });

  /* ==========================================================================
     6. TAB 3: TỶ GIÁ VIETCOMBANK & ĐỔI TIỀN CONTROLLER
     ========================================================================== */
  const currFromAmount = document.getElementById("currency-from-amount");
  const currToAmount = document.getElementById("currency-to-amount");
  const currFromSelect = document.getElementById("currency-from-select");
  const currToSelect = document.getElementById("currency-to-select");
  const currRateHint = document.getElementById("currency-exchange-rate-hint");
  const vcbTimestamp = document.getElementById("vcb-timestamp-text");
  const refreshRatesBtn = document.getElementById("btn-refresh-rates");
  const ratesTableBody = document.getElementById("rates-table-body");
  const currencySearchInput = document.getElementById("currency-search-input");
  const rateTypeBtns = document.querySelectorAll(".rate-type-btn");

  rateTypeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      rateTypeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.rateType = btn.getAttribute("data-type");
      calculateCurrency();
    });
  });

  function populateCurrencySelects(rateData) {
    const list = [{ code: "VND", name: "Việt Nam Đồng" }, ...rateData.items];
    
    const curFrom = currFromSelect.value || "USD";
    const curTo = currToSelect.value || "VND";

    currFromSelect.innerHTML = "";
    currToSelect.innerHTML = "";

    list.forEach(item => {
      const info = CurrencyManager.CURRENCY_INFO[item.code] || { flag: "🌐", name: item.name };
      
      const optFrom = document.createElement("option");
      optFrom.value = item.code;
      optFrom.textContent = `${info.flag} ${item.code} - ${info.name}`;
      currFromSelect.appendChild(optFrom);

      const optTo = document.createElement("option");
      optTo.value = item.code;
      optTo.textContent = `${info.flag} ${item.code} - ${info.name}`;
      currToSelect.appendChild(optTo);
    });

    currFromSelect.value = curFrom;
    currToSelect.value = curTo;
  }

  function calculateCurrency() {
    if (!state.currencyRates) return;

    const amount = currFromAmount.value;
    const fromCode = currFromSelect.value;
    const toCode = currToSelect.value;

    if (amount === "" || isNaN(amount) || amount < 0) {
      currToAmount.value = "";
      return;
    }

    const result = CurrencyManager.convertCurrency(amount, fromCode, toCode, state.currencyRates, state.rateType);
    currToAmount.value = CurrencyManager.formatMoney(result, toCode);

    // Rate Hint
    const singleRate = CurrencyManager.convertCurrency(1, fromCode, toCode, state.currencyRates, state.rateType);
    currRateHint.textContent = `1 ${fromCode} = ${CurrencyManager.formatMoney(singleRate, toCode)}`;
  }

  function renderRatesTable(searchTerm = "") {
    if (!state.currencyRates || !ratesTableBody) return;

    ratesTableBody.innerHTML = "";
    const term = searchTerm.toLowerCase().trim();

    const filtered = state.currencyRates.items.filter(item => {
      const info = CurrencyManager.CURRENCY_INFO[item.code] || { name: item.name };
      return (
        item.code.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        info.name.toLowerCase().includes(term)
      );
    });

    if (filtered.length === 0) {
      ratesTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">Không tìm thấy ngoại tệ phù hợp</td></tr>`;
      return;
    }

    filtered.forEach(item => {
      const info = CurrencyManager.CURRENCY_INFO[item.code] || { flag: "🌐", name: item.name, country: "" };
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div class="currency-cell">
            <span class="currency-flag">${info.flag}</span>
            <div class="currency-meta">
              <span>${item.code}</span>
              <span class="sub-name">${info.name}</span>
            </div>
          </div>
        </td>
        <td><strong>${item.buy ? item.buy.toLocaleString("vi-VN") : "-"}</strong></td>
        <td><strong>${item.transfer ? item.transfer.toLocaleString("vi-VN") : "-"}</strong></td>
        <td style="color: #ef4444;"><strong>${item.sell ? item.sell.toLocaleString("vi-VN") : "-"}</strong></td>
      `;
      ratesTableBody.appendChild(tr);
    });
  }

  async function loadCurrencyRates(forceRefresh = false) {
    refreshRatesBtn.classList.add("loading");
    vcbTimestamp.textContent = "Đang tải dữ liệu Vietcombank...";

    try {
      const res = await CurrencyManager.fetchExchangeRates(forceRefresh);
      state.currencyRates = res.data;

      vcbTimestamp.textContent = `Cập nhật: ${res.data.dateTime}`;
      
      // Chỉ hiện toast khi người dùng chủ động bấm nút "Làm mới"
      if (forceRefresh) {
        if (res.isFallback) {
          showToast("Đang dùng dữ liệu tỷ giá tham khảo (Offline)", "fa-triangle-exclamation");
        } else {
          showToast("Đã cập nhật tỷ giá Vietcombank mới nhất!");
        }
      }

      populateCurrencySelects(res.data);
      calculateCurrency();
      renderRatesTable(currencySearchInput.value);
    } catch (e) {
      console.error(e);
      vcbTimestamp.textContent = "Không thể tải tỷ giá";
      if (forceRefresh) {
        showToast("Lỗi khi tải tỷ giá", "fa-circle-xmark");
      }
    } finally {
      refreshRatesBtn.classList.remove("loading");
    }
  }

  // Currency Event Listeners
  currFromAmount.addEventListener("input", calculateCurrency);
  currFromSelect.addEventListener("change", calculateCurrency);
  currToSelect.addEventListener("change", calculateCurrency);

  document.getElementById("btn-swap-currency").addEventListener("click", () => {
    const temp = currFromSelect.value;
    currFromSelect.value = currToSelect.value;
    currToSelect.value = temp;
    calculateCurrency();
  });

  refreshRatesBtn.addEventListener("click", () => {
    loadCurrencyRates(true);
  });

  currencySearchInput.addEventListener("input", (e) => {
    renderRatesTable(e.target.value);
  });

  document.getElementById("btn-copy-currency-result").addEventListener("click", () => {
    if (currToAmount.value) {
      navigator.clipboard.writeText(currToAmount.value).then(() => {
        showToast("Đã sao chép số tiền quy đổi!");
      });
    }
  });

  /* ==========================================================================
     7. INITIALIZATION
     ========================================================================== */
  // Init Lunar Calendar
  renderHeaderToday();
  renderBlocCalendar(state.currentDate);
  renderMonthMatrix(state.viewMonthDate.getFullYear(), state.viewMonthDate.getMonth() + 1);

  // Init Unit Converter
  renderUnitCategories();
  populateUnitSelects();
  calculateUnitConversion();

  // Init Currency Rates
  loadCurrencyRates(false);

  // Register PWA Service Worker if supported
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
});
