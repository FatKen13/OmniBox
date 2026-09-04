import math
from PIL import Image, ImageDraw, ImageFilter

def create_omnibox_icon(size=512):
    # Tạo ảnh nền RGBA
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Vẽ Gradient nền từ Deep Midnight Blue sang Vibrant Sapphire Blue
    for y in range(size):
        ratio = y / size
        # Màu từ #0f172a (15, 23, 42) xuống #1e3a8a (30, 58, 138) xuống #2563eb (37, 99, 235)
        if ratio < 0.5:
            sub_r = ratio / 0.5
            r = int(15 * (1 - sub_r) + 25 * sub_r)
            g = int(23 * (1 - sub_r) + 45 * sub_r)
            b = int(42 * (1 - sub_r) + 110 * sub_r)
        else:
            sub_r = (ratio - 0.5) / 0.5
            r = int(25 * (1 - sub_r) + 37 * sub_r)
            g = int(45 * (1 - sub_r) + 99 * sub_r)
            b = int(110 * (1 - sub_r) + 235 * sub_r)
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

    # 2. Tạo quầng sáng Glow nhẹ ở tâm
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    cx, cy = size // 2, size // 2
    glow_draw.ellipse([cx - 160, cy - 160, cx + 160, cy + 160], fill=(59, 130, 246, 90))
    glow = glow.filter(ImageFilter.GaussianBlur(50))
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)

    # 3. Vẽ biểu tượng Trăng Khuyết Vàng (Moon) ở góc trên
    moon_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    m_draw = ImageDraw.Draw(moon_img)
    mx, my, mr = cx - 75, cy - 85, 45
    # Mặt trăng tròn vàng
    m_draw.ellipse([mx - mr, my - mr, mx + mr, my + mr], fill=(251, 191, 36, 255))
    # Che một phần tạo trăng khuyết nghệ thuật
    m_draw.ellipse([mx - mr + 16, my - mr - 10, mx + mr + 26, my + mr], fill=(0, 0, 0, 0))
    img = Image.alpha_composite(img, moon_img)
    draw = ImageDraw.Draw(img)

    # 4. Vẽ Khối Lập Phương 3D Đa Năng (Isometric OmniBox Cube)
    # Tọa độ tâm khối
    ox, oy = cx + 10, cy + 30
    w = 110
    h = 65
    dh = 120

    # Mặt trên (Top Face) - Màu Xanh Sáng Ngọc (Light Cyan / Sky)
    top_poly = [
        (ox, oy - h),
        (ox + w, oy),
        (ox, oy + h),
        (ox - w, oy)
    ]
    draw.polygon(top_poly, fill=(56, 189, 248, 255))

    # Mặt trái (Left Face) - Màu Xanh Dương Đậm (Royal Blue)
    left_poly = [
        (ox - w, oy),
        (ox, oy + h),
        (ox, oy + h + dh),
        (ox - w, oy + dh)
    ]
    draw.polygon(left_poly, fill=(29, 78, 216, 255))

    # Mặt phải (Right Face) - Màu Tím Xanh (Deep Indigo)
    right_poly = [
        (ox, oy + h),
        (ox + w, oy),
        (ox + w, oy + dh),
        (ox, oy + h + dh)
    ]
    draw.polygon(right_poly, fill=(67, 56, 202, 255))

    # 5. Đường viền phát sáng giữa các cạnh khối hộp (Edge Highlights)
    line_color = (255, 255, 255, 220)
    draw.line([(ox, oy - h), (ox + w, oy)], fill=line_color, width=3)
    draw.line([(ox + w, oy), (ox, oy + h)], fill=line_color, width=3)
    draw.line([(ox, oy + h), (ox - w, oy)], fill=line_color, width=3)
    draw.line([(ox - w, oy), (ox, oy - h)], fill=line_color, width=3)
    draw.line([(ox, oy + h), (ox, oy + h + dh)], fill=line_color, width=3)

    # 6. Ngôi sao 4 cánh lấp lánh (Sparkle Star)
    sx, sy = cx + 115, cy - 85
    s_rad = 22
    star_poly = [
        (sx, sy - s_rad), (sx + 5, sy - 5),
        (sx + s_rad, sy), (sx + 5, sy + 5),
        (sx, sy + s_rad), (sx - 5, sy + 5),
        (sx - s_rad, sy), (sx - 5, sy - 5)
    ]
    draw.polygon(star_poly, fill=(255, 255, 255, 255))

    return img

if __name__ == "__main__":
    icon_512 = create_omnibox_icon(512)
    icon_512.save("/Users/mini/Projects/AntiGravity/MoonCalendar/apple-touch-icon.png", "PNG")
    icon_512.save("/Users/mini/Projects/AntiGravity/MoonCalendar/icon-512.png", "PNG")
    
    icon_192 = icon_512.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save("/Users/mini/Projects/AntiGravity/MoonCalendar/icon-192.png", "PNG")
    icon_192.save("/Users/mini/Projects/AntiGravity/MoonCalendar/favicon.png", "PNG")
    print("Tao icon thanh cong!")
