#!/usr/bin/env python3
"""Crop the central badge logo from icon.png and generate PWA icon sizes."""
from PIL import Image
import os

BASE = "/home/ubuntu/hvac-errors"
src = Image.open(f"{BASE}/icons/icon.png").convert("RGBA")
w, h = src.size

# الشعار الدائري يقع في منتصف الصورة تقريباً
# قص المربع المحيط بالشعار الدائري (التقدير من الصورة: المركز ~ (480,420)/880x480 عرضياً...)
# الصورة 1408x768، مركز الدائرة تقريباً (672, 384) ونصف قطرها ~260
cx, cy, r = 672, 384, 275
box = (cx - r, cy - r, cx + r, cy + r)
logo = src.crop(box)

os.makedirs(f"{BASE}/icons/sizes", exist_ok=True)
for size in [192, 512]:
    icon = logo.resize((size, size), Image.LANCZOS)
    icon.save(f"{BASE}/icons/icon-{size}x{size}.png")

# تحديث apple-touch-icon و favicon بأفضل نسخة
touch = logo.resize((180, 180), Image.LANCZOS)
touch.save(f"{BASE}/icons/apple-touch-icon.png")

fav32 = logo.resize((32, 32), Image.LANCZOS)
fav32.save(f"{BASE}/icons/favicon-32x32.png")
fav16 = logo.resize((16, 16), Image.LANCZOS)
fav16.save(f"{BASE}/icons/favicon-16x16.png")

print("Icons generated successfully")
