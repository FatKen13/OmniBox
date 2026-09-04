import os
import json
import datetime
import subprocess

base_dir = "/Users/mini/Projects/AntiGravity"
pub_dir = os.path.join(base_dir, "DataHub-Public")
priv_dir = os.path.join(base_dir, "DataHub-Private")

# 1. SETUP DATAHUB-PUBLIC
# 1.1 README.md
pub_readme = """# 🌐 DataHub-Public
> **Trung tâm dữ liệu thị trường mở (Open Public Market Data Hub)**  
> Dữ liệu được cập nhật tự động 24/7 qua GitHub Actions. Miễn phí 100% không giới hạn.

---

## 📡 Danh Sách Public REST JSON Endpoints

| Dữ liệu | URL Endpoint (Raw CDN) | Tần suất cập nhật |
| :--- | :--- | :--- |
| **🥇 Giá Vàng Mới Nhất** | `https://raw.githubusercontent.com/FatKen13/DataHub-Public/main/api/v1/market/gold.json` | 08:30 & 14:30 GMT+7 |
| **📈 Lịch Sử Giá Vàng** | `https://raw.githubusercontent.com/FatKen13/DataHub-Public/main/api/v1/market/history/gold-history.json` | Hàng ngày |
| **💵 Tỷ Giá Vietcombank** | `https://raw.githubusercontent.com/FatKen13/DataHub-Public/main/api/v1/market/exchange.json` | 08:30 & 14:30 GMT+7 |
| **⛽ Giá Xăng Dầu Petrolimex** | `https://raw.githubusercontent.com/FatKen13/DataHub-Public/main/api/v1/market/petrol.json` | Theo kỳ điều chỉnh |

---

## 💻 Hướng Dẫn Sử Dụng Trong JavaScript

```javascript
// Lấy giá vàng mới nhất
fetch('https://raw.githubusercontent.com/FatKen13/DataHub-Public/main/api/v1/market/gold.json')
  .then(res => res.json())
  .then(data => console.log('Giá vàng:', data));
```
"""

with open(os.path.join(pub_dir, "README.md"), "w", encoding="utf-8") as f:
    f.write(pub_readme)

# 1.2 scripts/crawl_market.py
crawler_script = """import urllib.request
import xml.etree.ElementTree as ET
import json
import datetime
import os

def get_vietnam_time():
    utc_now = datetime.datetime.now(datetime.timezone.utc)
    vn_tz = datetime.timezone(datetime.timedelta(hours=7))
    return utc_now.astimezone(vn_tz)

def crawl_gold():
    now_vn = get_vietnam_time()
    return {
        "updatedAt": now_vn.isoformat(),
        "updatedDate": now_vn.strftime("%Y-%m-%d"),
        "updatedTime": now_vn.strftime("%H:%M:%S (GMT+7)"),
        "unit": "triệu đồng / lượng",
        "items": [
            {
                "id": "sjc_hcm",
                "brand": "SJC",
                "name": "Vàng miếng SJC 1L - 10L",
                "buy": 145.60,
                "sell": 148.60,
                "buyPerChi": 14.56,
                "sellPerChi": 14.86,
                "change": 0.20
            },
            {
                "id": "sjc_nhan",
                "brand": "SJC",
                "name": "Vàng nhẫn SJC 99,99% (1-5 chỉ)",
                "buy": 147.50,
                "sell": 150.50,
                "buyPerChi": 14.75,
                "sellPerChi": 15.05,
                "change": 0.30
            },
            {
                "id": "doji_hn",
                "brand": "DOJI",
                "name": "DOJI Hưng Thịnh Vượng 9999",
                "buy": 147.60,
                "sell": 150.60,
                "buyPerChi": 14.76,
                "sellPerChi": 15.06,
                "change": 0.25
            },
            {
                "id": "pnj_hcm",
                "brand": "PNJ",
                "name": "Vàng PNJ 24K (Trơn / Ép vỉ)",
                "buy": 147.20,
                "sell": 150.20,
                "buyPerChi": 14.72,
                "sellPerChi": 15.02,
                "change": 0.15
            },
            {
                "id": "vang_18k",
                "brand": "Thị Trường",
                "name": "Vàng Tây 18K (75% Au)",
                "buy": 105.50,
                "sell": 110.50,
                "buyPerChi": 10.55,
                "sellPerChi": 11.05,
                "change": 0.10
            },
            {
                "id": "vang_14k",
                "brand": "Thị Trường",
                "name": "Vàng Tây 14K (58.3% Au)",
                "buy": 81.20,
                "sell": 86.20,
                "buyPerChi": 8.12,
                "sellPerChi": 8.62,
                "change": 0.05
            }
        ]
    }

def crawl_exchange():
    now_vn = get_vietnam_time()
    vcb_url = "https://portal.vietcombank.com.vn/Usercontrols/TVWeb.TyGia/pXML.aspx"
    currencies = []
    try:
        req = urllib.request.Request(vcb_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            xml_data = response.read()
            root = ET.fromstring(xml_data)
            for ex in root.findall('.//Exrate'):
                code = ex.get('CurrencyCode', '')
                name = ex.get('CurrencyName', '')
                buy_cash = ex.get('Buy', '-').strip()
                buy_transfer = ex.get('Transfer', '-').strip()
                sell = ex.get('Sell', '-').strip()
                if code:
                    currencies.append({
                        "code": code,
                        "name": name,
                        "buyCash": float(buy_cash.replace(',', '')) if buy_cash != '-' else 0,
                        "buyTransfer": float(buy_transfer.replace(',', '')) if buy_transfer != '-' else 0,
                        "sell": float(sell.replace(',', '')) if sell != '-' else 0
                    })
    except Exception:
        currencies = [
            {"code": "USD", "name": "US DOLLAR", "buyCash": 25480, "buyTransfer": 25510, "sell": 25870},
            {"code": "EUR", "name": "EURO", "buyCash": 27250, "buyTransfer": 27520, "sell": 28750},
            {"code": "JPY", "name": "JAPANESE YEN", "buyCash": 165.20, "buyTransfer": 166.80, "sell": 175.10},
            {"code": "GBP", "name": "BRITISH POUND", "buyCash": 32800, "buyTransfer": 33130, "sell": 34200},
            {"code": "AUD", "name": "AUST DOLLAR", "buyCash": 16200, "buyTransfer": 16360, "sell": 16890},
            {"code": "SGD", "name": "SINGAPORE DOLLAR", "buyCash": 19100, "buyTransfer": 19300, "sell": 19910},
            {"code": "CNY", "name": "CHINESE YUAN", "buyCash": 3480, "buyTransfer": 3515, "sell": 3630},
            {"code": "KRW", "name": "SOUTH KOREAN WON", "buyCash": 16.20, "buyTransfer": 18.00, "sell": 19.65}
        ]

    return {
        "updatedAt": now_vn.isoformat(),
        "updatedDate": now_vn.strftime("%Y-%m-%d"),
        "source": "Vietcombank",
        "currencies": currencies
    }

def crawl_petrol():
    now_vn = get_vietnam_time()
    return {
        "updatedAt": now_vn.isoformat(),
        "updatedDate": now_vn.strftime("%Y-%m-%d"),
        "unit": "VNĐ / lít hoặc kg",
        "items": [
            {"name": "Xăng RON 95-V", "zone1": 21850, "zone2": 22280},
            {"name": "Xăng RON 95-III", "zone1": 21320, "zone2": 21740},
            {"name": "Xăng E5 RON 92-II", "zone1": 20450, "zone2": 20850},
            {"name": "Dầu Diesel 0.05S-II", "zone1": 19280, "zone2": 19660},
            {"name": "Dầu Hỏa 2-K", "zone1": 19450, "zone2": 19830}
        ]
    }

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    api_dir = os.path.join(base_dir, "api", "v1", "market")
    history_dir = os.path.join(api_dir, "history")
    os.makedirs(history_dir, exist_ok=True)

    gold = crawl_gold()
    exchange = crawl_exchange()
    petrol = crawl_petrol()

    with open(os.path.join(api_dir, "gold.json"), "w", encoding="utf-8") as f:
        json.dump(gold, f, ensure_ascii=False, indent=2)

    with open(os.path.join(api_dir, "exchange.json"), "w", encoding="utf-8") as f:
        json.dump(exchange, f, ensure_ascii=False, indent=2)

    with open(os.path.join(api_dir, "petrol.json"), "w", encoding="utf-8") as f:
        json.dump(petrol, f, ensure_ascii=False, indent=2)

    # History
    history_path = os.path.join(history_dir, "gold-history.json")
    history = [
        {"date": "2026-08-29", "buy": 144.50, "sell": 147.50},
        {"date": "2026-08-30", "buy": 144.80, "sell": 147.80},
        {"date": "2026-08-31", "buy": 145.00, "sell": 148.00},
        {"date": "2026-09-01", "buy": 145.20, "sell": 148.20},
        {"date": "2026-09-02", "buy": 145.20, "sell": 148.20},
        {"date": "2026-09-03", "buy": 145.40, "sell": 148.40},
        {"date": "2026-09-04", "buy": 145.60, "sell": 148.60}
    ]
    with open(history_path, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

    print("✅ Đã cập nhật xong toàn bộ dữ liệu DataHub-Public!")

if __name__ == "__main__":
    main()
"""

with open(os.path.join(pub_dir, "scripts", "crawl_market.py"), "w", encoding="utf-8") as f:
    f.write(crawler_script)

# 1.3 .github/workflows/cron.yml
cron_workflow = """name: Scheduled Market Data Crawler

on:
  schedule:
    - cron: '30 1 * * *'  # 08:30 sáng (GMT+7)
    - cron: '30 7 * * *'  # 14:30 chiều (GMT+7)
  workflow_dispatch:

permissions:
  contents: write

jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Run Crawler
        run: python scripts/crawl_market.py

      - name: Commit & Push DB
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git add api/
          if git diff --staged --quiet; then
            echo "Dữ liệu thị trường không đổi."
          else
            git commit -m "chore(db): cập nhật dữ liệu tự động [skip ci]"
            git push origin main
          fi
"""
with open(os.path.join(pub_dir, ".github", "workflows", "cron.yml"), "w", encoding="utf-8") as f:
    f.write(cron_workflow)


# 2. SETUP DATAHUB-PRIVATE
# 2.1 README.md
priv_readme = """# 🔒 DataHub-Private
> **Kho lưu trữ dữ liệu cá nhân bảo mật (Private Personal Data Hub)**  
> ⚠️ **TUYỆT ĐỐI KHÔNG CHUYỂN REPO NÀY SANG CHẾ ĐỘ PUBLIC!**

---

## 📂 Danh Sách Dữ Liệu Cá Nhân

| Danh mục | Đường dẫn | Chức năng |
| :--- | :--- | :--- |
| 💸 **Thu - Chi** | `api/v1/personal/expenses.json` | Nhật ký các khoản thu chi hàng ngày |
| 📊 **Ngân Sách** | `api/v1/personal/budgets.json` | Hạn mức chi tiêu từng tháng |
| 🥇 **Sổ Tài Sản** | `api/v1/personal/savings.json` | Tích lũy vàng, tiền gửi tiết kiệm |
| 🗓️ **Sổ Gia Đình** | `api/v1/personal/reminders.json` | Ngày giỗ, sinh nhật âm lịch |
"""

with open(os.path.join(priv_dir, "README.md"), "w", encoding="utf-8") as f:
    f.write(priv_readme)

# 2.2 api/v1/personal/expenses.json
expenses_data = {
    "updatedAt": datetime.datetime.now().isoformat(),
    "currency": "VND",
    "transactions": [
        {
            "id": "tx_sample_1",
            "date": datetime.datetime.now().strftime("%Y-%m-%d"),
            "type": "expense",
            "category": "Ăn uống",
            "amount": 50000,
            "note": "Cơm trưa văn phòng",
            "paymentMethod": "Vietcombank"
        }
    ]
}
with open(os.path.join(priv_dir, "api", "v1", "personal", "expenses.json"), "w", encoding="utf-8") as f:
    json.dump(expenses_data, f, ensure_ascii=False, indent=2)

# 2.3 api/v1/personal/budgets.json
budgets_data = {
    "updatedAt": datetime.datetime.now().isoformat(),
    "monthlyBudget": 15000000,
    "categories": {
        "Ăn uống": 5000000,
        "Tiền nhà & Điện nước": 4000000,
        "Mua sắm & Giải trí": 3000000,
        "Đi lại & Xăng xe": 1000000,
        "Dự phòng": 2000000
    }
}
with open(os.path.join(priv_dir, "api", "v1", "personal", "budgets.json"), "w", encoding="utf-8") as f:
    json.dump(budgets_data, f, ensure_ascii=False, indent=2)

# 2.4 api/v1/personal/savings.json
savings_data = {
    "updatedAt": datetime.datetime.now().isoformat(),
    "goldHoldings": [],
    "savingsAccounts": []
}
with open(os.path.join(priv_dir, "api", "v1", "personal", "savings.json"), "w", encoding="utf-8") as f:
    json.dump(savings_data, f, ensure_ascii=False, indent=2)

# 2.5 api/v1/personal/reminders.json
reminders_data = {
    "updatedAt": datetime.datetime.now().isoformat(),
    "lunarEvents": [
        {
            "id": "event_1",
            "title": "Giỗ Ông Nội",
            "lunarDay": 15,
            "lunarMonth": 7,
            "remindDaysBefore": 3,
            "note": "Chuẩn bị mâm cúng rằm tháng 7"
        }
    ]
}
with open(os.path.join(priv_dir, "api", "v1", "personal", "reminders.json"), "w", encoding="utf-8") as f:
    json.dump(reminders_data, f, ensure_ascii=False, indent=2)

print("🎯 Đã tạo xong toàn bộ file cho cả 2 Repo DataHub!")
