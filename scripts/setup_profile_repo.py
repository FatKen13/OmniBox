import os
import shutil

src_arch = "/Users/mini/Projects/AntiGravity/MoonCalendar/ARCHITECTURE.md"
dest_repo = "/Users/mini/Projects/AntiGravity/FatKen13"
docs_dir = os.path.join(dest_repo, "docs")
templates_dir = os.path.join(dest_repo, "templates")

os.makedirs(docs_dir, exist_ok=True)
os.makedirs(templates_dir, exist_ok=True)

# 1. Copy ARCHITECTURE.md into docs/
shutil.copyfile(src_arch, os.path.join(docs_dir, "ARCHITECTURE.md"))

# 2. Tạo templates/PROJECT_TEMPLATE.md
template_content = """# 🚀 TEMPLATE CẤU TRÚC DỰ ÁN MỚI
> *Copy file này vào bất kỳ dự án mới nào để thiết lập quy chuẩn ngay lập tức.*

## 1. Kết Nối DataHub
Dự án này sử dụng trung tâm dữ liệu tập trung **DataHub**:
- **Dữ liệu công khai**: Lấy từ `https://raw.githubusercontent.com/FatKen13/DataHub-Public/main/api/v1/...`
- **Dữ liệu cá nhân**: Đọc/ghi qua GitHub PAT vào repo `FatKen13/DataHub-Private`
- **Tài liệu kiến trúc đầy đủ**: Tham khảo tại [FatKen13 Architecture](https://github.com/FatKen13/FatKen13/blob/main/docs/ARCHITECTURE.md)

## 2. Cấu Trúc Thư Mục Tiêu Chuẩn
```text
ProjectName/
├── index.html        # Giao diện chính (HTML5 Semantic)
├── style.css         # Design System (Glassmorphism, Dark/Light)
├── manifest.json     # Cấu hình PWA Web App
├── sw.js             # Service Worker chạy Offline
├── js/
│   ├── app.js        # Controller chính
│   └── datahub.js    # Module gọi DataHub API
└── ARCHITECTURE.md   # Bản sao tài liệu kiến trúc
```
"""

with open(os.path.join(templates_dir, "PROJECT_TEMPLATE.md"), "w", encoding="utf-8") as f:
    f.write(template_content)

# 3. Tạo README.md cho GitHub Profile FatKen13
profile_readme = """# 👋 Xin chào, tôi là FatKen13!
> *Full-stack Developer & Creator of OmniBox Ecosystem*

---

## 🏛️ BẢN ĐỒ HỆ SINH THÁI DỰ ÁN (ECOSYSTEM MAP)

```mermaid
graph TD
    Profile[🌟 FatKen13 Master Hub] --> DataPub[🌐 DataHub-Public<br>Data Thị Trường Mở]
    Profile --> DataPriv[🔒 DataHub-Private<br>Data Cá Nhân Bảo Mật]
    
    DataPub --> App1[📱 OmniBox<br>Lịch, Đơn Vị, Giá Vàng]
    DataPub --> App2[💻 Web Dashboard / Analytics]
    DataPriv --> App1
```

---

## 🚀 DANH SÁCH DỰ ÁN & REPOSITORIES

| Dự án | Loại | Mô tả | Liên kết |
| :--- | :--- | :--- | :--- |
| **📱 OmniBox** | Frontend / PWA | Lịch Vạn Niên GMT+7, Đổi Đơn Vị 9 nhóm, Giá Vàng & Tỷ Giá Vietcombank | [🔗 Repo](https://github.com/FatKen13/OmniBox) • [🌐 Live App](https://fatken13.github.io/OmniBox/) |
| **🌐 DataHub-Public** | Public Data | Kho API JSON miễn phí: Giá vàng SJC, Tỷ giá VCB, Giá xăng Petrolimex | [🔗 Repo](https://github.com/FatKen13/DataHub-Public) |
| **🔒 DataHub-Private** | Private Vault | Kho lưu trữ dữ liệu cá nhân bảo mật: Thu chi, Ngân sách, Sổ vàng | [🔒 Repo (Private)](https://github.com/FatKen13/DataHub-Private) |

---

## 📚 TÀI LIỆU QUY CHUẨN & KIẾN TRÚC HỆ THỐNG

Tất cả các dự án trong hệ sinh thái đều tuân theo bản thiết kế chuẩn:
* 🏛️ **[Tài liệu Kiến trúc Toàn diện (ARCHITECTURE.md)](./docs/ARCHITECTURE.md)**: Chi tiết cấu trúc thư mục, Schemas JSON, cơ chế crawler và SDK đồng bộ.
* 📋 **[Khung Mẫu Dự Án Mới (PROJECT_TEMPLATE.md)](./templates/PROJECT_TEMPLATE.md)**: File mẫu copy nhanh khi bắt đầu dự án mới.

---

## 🛠️ CÔNG NGHỆ CHỦ ĐẠO
`HTML5` • `Vanilla CSS3 (Glassmorphism)` • `Modern JavaScript (ES6+)` • `Python Automation` • `GitHub Actions CI/CD` • `PWA`
"""

with open(os.path.join(dest_repo, "README.md"), "w", encoding="utf-8") as f:
    f.write(profile_readme)

print("✅ Đã tạo xong tài liệu và cấu trúc cho repo FatKen13!")
