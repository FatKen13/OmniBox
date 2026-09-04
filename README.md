# 📱 OmniBox (Lịch Vạn Niên, Đổi Đơn Vị, Tài Chính)

> **Ứng dụng tiện ích đa năng tất-cả-trong-một (All-in-One Utility Web App & PWA)**  
> 🌐 **Trải nghiệm trực tiếp:** [https://fatken13.github.io/OmniBox/](https://fatken13.github.io/OmniBox/)

---

## ✨ Tính Năng Nổi Bật

1. 🗓️ **Lịch Vạn Niên Chuẩn GMT+7**:
   * Chuyển đổi Âm - Dương theo thuật toán thiên văn học chính xác.
   * Can Chi năm/tháng/ngày/giờ, Tiết Khí, Ngày Hoàng Đạo / Hắc Đạo, 12 Khung Giờ trong ngày.
   * Tra cứu ngày theo Dương Lịch, Âm Lịch và các ngày lễ truyền thống Việt Nam.

2. 📐 **Đổi Đơn Vị Đo Lường (9 Nhóm)**:
   * Chiều dài, Diện tích, Khối lượng, Dung tích, Nhiệt độ, Tốc độ, Dữ liệu số, Thời gian, Năng lượng.
   * Hỗ trợ đầy đủ các đơn vị cổ truyền Việt Nam (*Sào Bắc/Trung/Nam, Mẫu, Thước, Chỉ/Lượng vàng, Lạng*).

3. 💰 **Tài Chính & Thị Trường**:
   * **Giá Vàng Trực Tuyến**: SJC, DOJI, PNJ, Nhẫn 9999, Vàng 18K/14K cập nhật mới nhất.
   * **Biểu Đồ Biến Động**: Biểu đồ tương tác Chart.js theo dõi lịch sử giá vàng 7 ngày / 30 ngày.
   * **Tỷ Giá Vietcombank**: Bảng tỷ giá ngoại tệ ngân hàng VCB và công cụ quy đổi 2 chiều tức thì.

4. 📲 **Chuẩn PWA (Progressive Web App)**:
   * Cài đặt mượt mà lên màn hình chính iPhone / iPad / Android như app Native.
   * Tự động lưu cache, hỗ trợ hoạt động ngoại tuyến (Offline).

---

## 🏛️ Kiến Trúc & Hệ Sinh Thái

* 📖 **Tài liệu kiến trúc hệ thống**: [ARCHITECTURE.md](./ARCHITECTURE.md)
* 🌐 **Trung tâm dữ liệu công khai**: [FatKen13/DataHub-Public](https://github.com/FatKen13/DataHub-Public)
* 🔒 **Kho dữ liệu cá nhân bảo mật**: [FatKen13/DataHub-Private](https://github.com/FatKen13/DataHub-Private)
* 🌟 **Master Profile Hub**: [FatKen13](https://github.com/FatKen13/FatKen13)

---

## 💻 Chạy Cục Bộ (Local Development)

```bash
# Clone dự án
git clone https://github.com/FatKen13/OmniBox.git
cd OmniBox

# Mở server cục bộ
python3 -m http.server 3000
# Truy cập tại: http://localhost:3000
```
