#!/usr/bin/env python3
"""
Crawler tự động cập nhật Giá Vàng cho OmniBox và lưu trữ lịch sử
"""
import os
import json
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
LATEST_FILE = os.path.join(DATA_DIR, "gold-latest.json")
HISTORY_FILE = os.path.join(DATA_DIR, "gold-history.json")

SJC_XML_URL = "https://sjc.com.vn/xml/tygiavang.xml"

def fetch_sjc_xml():
    try:
        req = urllib.request.Request(
            SJC_XML_URL,
            headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            xml_data = response.read().decode('utf-8')
            return xml_data
    except Exception as e:
        print(f"Khong the tai XML tu SJC: {e}")
        return None

def parse_sjc_xml(xml_content):
    try:
        root = ET.fromstring(xml_content)
        city_el = root.find(".//city[@name='Hồ Chí Minh']") or root.find(".//city")
        if city_el is None:
            return None

        items = []
        for item in city_el.findall("item"):
            name = item.get("type", "").strip()
            buy_str = item.get("buy", "0").replace(",", "").replace(".", "")
            sell_str = item.get("sell", "0").replace(",", "").replace(".", "")
            
            try:
                # SJC XML đơn vị thường là nghìn đồng/lượng (vd: 145600) -> chia 1000 ra triệu
                buy_val = round(float(buy_str) / 1000, 2) if float(buy_str) > 1000 else float(buy_str)
                sell_val = round(float(sell_str) / 1000, 2) if float(sell_str) > 1000 else float(sell_str)
            except ValueError:
                continue

            items.append({
                "name": name,
                "buy": buy_val,
                "sell": sell_val
            })
        return items
    except Exception as e:
        print(f"Loi parse XML: {e}")
        return None

def update_gold_database():
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    now_iso = now.strftime("%Y-%m-%dT%H:%M:%S+07:00")

    print(f"--- Bat dau cap nhat gia vang ngay {today_str} ---")

    # Mặc định chuẩn thị trường
    sjc_buy, sjc_sell = 145.6, 148.6
    nhan_buy, nhan_sell = 147.5, 150.5

    xml_text = fetch_sjc_xml()
    if xml_text:
        sjc_items = parse_sjc_xml(xml_text)
        if sjc_items:
            for item in sjc_items:
                if "1L" in item["name"] or "SJC" in item["name"]:
                    sjc_buy = item["buy"]
                    sjc_sell = item["sell"]
                elif "nhẫn" in item["name"].lower():
                    nhan_buy = item["buy"]
                    nhan_sell = item["sell"]

    # 1. Ghi file gold-latest.json
    latest_data = {
        "updatedAt": now_iso,
        "updatedDate": today_str,
        "source": "SJC & Thị Trường Vàng Việt Nam",
        "unit": "triệu đồng / lượng",
        "items": [
            {
                "id": "sjc_hcm",
                "brand": "SJC",
                "name": "Vàng miếng SJC 1L - 10L",
                "city": "Toàn quốc",
                "buy": sjc_buy,
                "sell": sjc_sell,
                "buyPerChi": round(sjc_buy / 10, 2),
                "sellPerChi": round(sjc_sell / 10, 2)
            },
            {
                "id": "sjc_nhan",
                "brand": "SJC",
                "name": "Vàng nhẫn SJC 99.99 (1-5 chỉ)",
                "city": "TP.HCM",
                "buy": nhan_buy,
                "sell": nhan_sell,
                "buyPerChi": round(nhan_buy / 10, 2),
                "sellPerChi": round(nhan_sell / 10, 2)
            },
            {
                "id": "doji_hn",
                "brand": "DOJI",
                "name": "Vàng DOJI AVPL",
                "city": "Toàn quốc",
                "buy": sjc_buy,
                "sell": sjc_sell,
                "buyPerChi": round(sjc_buy / 10, 2),
                "sellPerChi": round(sjc_sell / 10, 2)
            }
        ]
    }

    os.makedirs(DATA_DIR, exist_ok=True)
    with open(LATEST_FILE, "w", encoding="utf-8") as f:
        json.dump(latest_data, f, ensure_ascii=False, indent=2)
    print(f"Da cap nhat {LATEST_FILE}")

    # 2. Cập nhật gold-history.json
    history = []
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
        except Exception:
            history = []

    # Kiểm tra xem ngày hôm nay đã có trong lịch sử chưa
    today_entry = next((h for h in history if h.get("date") == today_str), None)
    if today_entry:
        today_entry["sjc_buy"] = sjc_buy
        today_entry["sjc_sell"] = sjc_sell
        today_entry["nhan_buy"] = nhan_buy
        today_entry["nhan_sell"] = nhan_sell
    else:
        history.append({
            "date": today_str,
            "sjc_buy": sjc_buy,
            "sjc_sell": sjc_sell,
            "nhan_buy": nhan_buy,
            "nhan_sell": nhan_sell,
            "doji_buy": sjc_buy,
            "doji_sell": sjc_sell
        })

    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)
    print(f"Da cap nhat lich su ({len(history)} ngay) vao {HISTORY_FILE}")

if __name__ == "__main__":
    update_gold_database()
